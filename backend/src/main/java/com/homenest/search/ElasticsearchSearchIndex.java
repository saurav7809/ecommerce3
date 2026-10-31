package com.homenest.search;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.homenest.catalog.Product;
import com.homenest.config.AppProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.*;

/**
 * Elasticsearch (e.g. Elastic Cloud) product index accessed through the REST API.
 * Enable with ELASTICSEARCH_ENABLED=true, ELASTICSEARCH_URL and ELASTICSEARCH_API_KEY.
 * Errors are logged and never break the storefront: search falls back to PostgreSQL.
 */
@Component
@ConditionalOnProperty(prefix = "app.search.elasticsearch", name = "enabled", havingValue = "true")
public class ElasticsearchSearchIndex implements ProductSearchIndex {
    private static final Logger log = LoggerFactory.getLogger(ElasticsearchSearchIndex.class);

    private static final String MAPPING = """
            {"mappings":{"properties":{
              "name":{"type":"text"},"brand":{"type":"text","fields":{"raw":{"type":"keyword"}}},
              "category":{"type":"text"},"description":{"type":"text"},"style":{"type":"text"},
              "room":{"type":"text"},"color":{"type":"text"},"material":{"type":"text"},
              "active":{"type":"boolean"}}}}""";

    private final RestClient client;
    private final ObjectMapper json;
    private final String index;

    public ElasticsearchSearchIndex(AppProperties properties, RestClient.Builder builder, ObjectMapper json) {
        var es = properties.search().elasticsearch();
        if (es.url() == null || es.url().isBlank()) {
            throw new IllegalStateException("ELASTICSEARCH_URL is required when ELASTICSEARCH_ENABLED=true");
        }
        this.index = es.index();
        this.json = json;
        this.client = builder.baseUrl(es.url().replaceAll("/+$", ""))
                .defaultHeaders(h -> {
                    if (es.apiKey() != null && !es.apiKey().isBlank()) h.set("Authorization", "ApiKey " + es.apiKey());
                })
                .build();
    }

    @Override
    public boolean enabled() { return true; }

    @Override
    public Optional<List<Long>> search(String query, int limit) {
        Map<String, Object> body = Map.of(
                "size", limit,
                "_source", false,
                "query", Map.of("bool", Map.of(
                        "must", Map.of("multi_match", Map.of(
                                "query", query,
                                "fields", List.of("name^4", "brand^2", "category^3", "style^2", "room^2", "color", "material", "description"),
                                "fuzziness", "AUTO",
                                "operator", "and")),
                        "filter", Map.of("term", Map.of("active", true)))));
        try {
            JsonNode result = client.post().uri("/{index}/_search", index)
                    .contentType(MediaType.APPLICATION_JSON).body(body)
                    .retrieve().body(JsonNode.class);
            List<Long> ids = new ArrayList<>();
            if (result != null) {
                for (JsonNode hit : result.path("hits").path("hits")) ids.add(hit.path("_id").asLong());
            }
            return Optional.of(ids);
        } catch (RestClientException e) {
            log.warn("Elasticsearch search failed, falling back to database search: {}", e.getMessage());
            return Optional.empty();
        }
    }

    @Override
    public void index(Product product) {
        indexAll(List.of(product));
    }

    @Override
    public void indexAll(Collection<Product> products) {
        if (products.isEmpty()) return;
        try {
            ensureIndex();
            StringBuilder ndjson = new StringBuilder();
            for (Product p : products) {
                ndjson.append(json.writeValueAsString(Map.of("index", Map.of("_index", index, "_id", p.getId().toString())))).append('\n');
                ndjson.append(json.writeValueAsString(document(p))).append('\n');
            }
            client.post().uri("/_bulk")
                    .contentType(MediaType.parseMediaType("application/x-ndjson"))
                    .body(ndjson.toString())
                    .retrieve().toBodilessEntity();
        } catch (RestClientException | JsonProcessingException e) {
            log.warn("Elasticsearch indexing failed for {} products: {}", products.size(), e.getMessage());
        }
    }

    @Override
    public void remove(Long productId) {
        try {
            client.delete().uri("/{index}/_doc/{id}", index, productId)
                    .retrieve().onStatus(HttpStatusCode::is4xxClientError, (req, res) -> { })
                    .toBodilessEntity();
        } catch (RestClientException e) {
            log.warn("Elasticsearch delete failed for product {}: {}", productId, e.getMessage());
        }
    }

    private void ensureIndex() {
        var exists = client.head().uri("/{index}", index).retrieve()
                .onStatus(HttpStatusCode::is4xxClientError, (req, res) -> { })
                .toBodilessEntity();
        if (exists.getStatusCode().value() == 404) {
            client.put().uri("/{index}", index).contentType(MediaType.APPLICATION_JSON).body(MAPPING)
                    .retrieve().toBodilessEntity();
            log.info("Created Elasticsearch index {}", index);
        }
    }

    private Map<String, Object> document(Product p) {
        Map<String, Object> doc = new HashMap<>();
        doc.put("name", p.getName());
        doc.put("brand", p.getBrand());
        doc.put("category", p.getCategory().getName());
        doc.put("description", p.getDescription());
        doc.put("style", p.getStyle());
        doc.put("room", p.getRoom());
        doc.put("color", p.getColor());
        doc.put("material", p.getMaterial());
        doc.put("active", p.isActive());
        return doc;
    }
}
