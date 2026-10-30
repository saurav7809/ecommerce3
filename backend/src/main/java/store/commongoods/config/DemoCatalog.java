package store.commongoods.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import store.commongoods.product.Product;
import store.commongoods.product.ProductRepository;
import java.math.BigDecimal;
import java.util.List;

@Configuration
public class DemoCatalog {
    @Bean CommandLineRunner seedProducts(ProductRepository products) { return args -> {
        if (products.count() != 0) return;
        products.saveAll(List.of(
            new Product("Everyday Ceramic Set","Home",new BigDecimal("4800"),"https://images.unsplash.com/photo-1490312278390-ab64016e0aa9?auto=format&fit=crop&w=900&q=85","Sand / 4 pieces","Hand-finished stoneware for slow mornings and long dinners.",20,true),
            new Product("The Sunday Tote","Accessories",new BigDecimal("3600"),"https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=900&q=85","Natural canvas","A roomy, sturdy companion for your everyday.",35,true),
            new Product("Cloud Knit Throw","Home",new BigDecimal("9200"),"https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=900&q=85","Oatmeal / 130 × 170 cm","A soft, breathable layer woven from recycled cotton.",14,true),
            new Product("Quiet Morning Candle","Wellness",new BigDecimal("2800"),"https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=900&q=85","Cedarwood & fig / 220 g","A warm, unhurried scent poured into reusable glass.",40,false),
            new Product("Daily Journal","Stationery",new BigDecimal("2400"),"https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=900&q=85","Forest / 192 pages","A little space to think, plan, and make a mess.",50,false),
            new Product("Sunday Glasses","Home",new BigDecimal("3400"),"https://images.unsplash.com/photo-1513558161293-cdaf765edfd4?auto=format&fit=crop&w=900&q=85","Set of 2 / recycled glass","Light-catching, hand-blown glass for every day.",18,false),
            new Product("Market Day Basket","Accessories",new BigDecimal("5800"),"https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=900&q=85","Natural / handwoven","A little more room for good finds and fresh flowers.",12,false),
            new Product("Soft Form Vase","Home",new BigDecimal("4200"),"https://images.unsplash.com/photo-1578500494198-246f612d3b3d?auto=format&fit=crop&w=900&q=85","Chalk / 24 cm","A sculptural, simple shape made to hold the everyday.",16,false)
        ));
    }; }
}
