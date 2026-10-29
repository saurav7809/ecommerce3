<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductApprovalHistory;
use App\Models\ProductImage;
use App\Models\ProductIncludedItem;
use App\Models\ProductReturnPolicy;
use App\Models\ProductShipping;
use App\Models\ProductSpecification;
use App\Models\ProductTag;
use App\Models\ProductTax;
use App\Models\ProductVariant;
use App\Models\ProductVideo;
use App\Models\ProductWarranty;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $seller = $this->seller();
        $products = Product::where('seller_id', $seller->id)
            ->with(['category', 'brand', 'primaryImage'])
            ->when($request->filled('q'), function ($query) use ($request) {
                $term = $request->string('q')->toString();
                $query->where(function ($query) use ($term) {
                    $query->where('name', 'like', "%{$term}%")
                        ->orWhere('sku', 'like', "%{$term}%")
                        ->orWhere('seller_sku', 'like', "%{$term}%");
                });
            })
            ->when($request->filled('status'), fn ($query) => $query->where('status', $request->string('status')))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return view('seller.products.index', compact('seller', 'products'));
    }

    public function create()
    {
        $seller = $this->seller();
        $categories = Category::active()->parents()->with(['children' => fn ($query) => $query->active()->orderBy('sort_order')->orderBy('name')])->orderBy('sort_order')->orderBy('name')->get();
        $brands = Brand::active()->orderBy('name')->get();

        return view('seller.products.create', compact('seller', 'categories', 'brands'));
    }

    public function store(Request $request)
    {
        $seller = $this->seller();
        $data = $this->validated($request, $seller->id);
        $submit = $request->boolean('submit_for_approval');

        $product = DB::transaction(function () use ($request, $data, $seller, $submit) {
            $product = Product::create($this->productData($request, $data, $seller->id, $submit));
            $this->syncChildren($request, $product);
            $this->saveImages($request, $product);
            ProductApprovalHistory::create([
                'product_id' => $product->id,
                'status' => $product->status,
                'reason' => $submit ? 'Submitted by seller' : null,
            ]);

            return $product;
        });

        return redirect()->route('seller.products.edit', $product)->with('success', $submit ? 'Product submitted for approval.' : 'Product saved as draft.');
    }

    public function edit(Product $product)
    {
        $this->authorizeProduct($product);
        $seller = $this->seller();
        $categories = Category::active()->parents()->with(['children' => fn ($query) => $query->active()->orderBy('sort_order')->orderBy('name')])->orderBy('sort_order')->orderBy('name')->get();
        $brands = Brand::active()->orderBy('name')->get();
        $product->load(['images', 'variants', 'specifications', 'tags', 'includedItems', 'shipping', 'warranty', 'returnPolicy', 'tax', 'videos']);

        return view('seller.products.edit', compact('seller', 'product', 'categories', 'brands'));
    }

    public function update(Request $request, Product $product)
    {
        $this->authorizeProduct($product);
        $seller = $this->seller();
        $data = $this->validated($request, $seller->id, $product->id);
        $submit = $request->boolean('submit_for_approval');

        DB::transaction(function () use ($request, $data, $product, $seller, $submit) {
            $product->update($this->productData($request, $data, $seller->id, $submit));
            $this->syncChildren($request, $product);
            if ($request->hasFile('images')) {
                $product->images()->delete();
                $this->saveImages($request, $product);
            }
            ProductApprovalHistory::create([
                'product_id' => $product->id,
                'status' => $product->status,
                'reason' => $submit ? 'Resubmitted by seller' : null,
            ]);
        });

        return redirect()->route('seller.products.edit', $product)->with('success', $submit ? 'Product submitted for approval.' : 'Product changes saved.');
    }

    public function destroy(Product $product)
    {
        $this->authorizeProduct($product);
        $product->delete();

        return redirect()->route('seller.products.index')->with('success', 'Product moved to the recycle bin.');
    }

    private function validated(Request $request, int $sellerId, ?int $productId = null): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'title' => ['required', 'string', 'max:255'],
            'short_name' => ['nullable', 'string', 'max:255'],
            'subtitle' => ['nullable', 'string', 'max:255'],
            'category_id' => ['required', Rule::exists('categories', 'id')->where('is_active', true)],
            'brand_id' => ['nullable', Rule::exists('brands', 'id')->where('is_active', true)],
            'sku' => ['required', 'string', 'max:100', Rule::unique('products', 'sku')->ignore($productId)],
            'seller_sku' => ['nullable', 'string', 'max:100', Rule::unique('products', 'seller_sku')->where(fn ($query) => $query->where('seller_id', $sellerId))->ignore($productId)],
            'model_number' => ['nullable', 'string', 'max:100'],
            'model_name' => ['nullable', 'string', 'max:255'],
            'manufacturer' => ['nullable', 'string', 'max:255'],
            'product_type' => ['nullable', 'string', 'max:100'],
            'condition' => ['required', Rule::in(['new', 'refurbished', 'used'])],
            'short_description' => ['nullable', 'string', 'max:2000'],
            'description' => ['nullable', 'string'],
            'highlights' => ['nullable', 'string', 'max:5000'],
            'whats_included' => ['nullable', 'string', 'max:5000'],
            'usage_instructions' => ['nullable', 'string', 'max:5000'],
            'care_instructions' => ['nullable', 'string', 'max:5000'],
            'price' => ['required', 'numeric', 'min:0'],
            'compare_price' => ['required', 'numeric', 'min:0', 'gte:price'],
            'cost_price' => ['nullable', 'numeric', 'min:0'],
            'discount_type' => ['nullable', Rule::in(['percentage', 'fixed'])],
            'discount_value' => ['nullable', 'numeric', 'min:0'],
            'stock_quantity' => ['required', 'integer', 'min:0'],
            'reserved_quantity' => ['nullable', 'integer', 'min:0', 'lte:stock_quantity'],
            'low_stock_threshold' => ['required', 'integer', 'min:0'],
            'min_order_quantity' => ['required', 'integer', 'min:1'],
            'max_order_quantity' => ['nullable', 'integer', 'gte:min_order_quantity'],
            'barcode' => ['nullable', 'string', 'max:100'],
            'weight' => ['nullable', 'numeric', 'min:0'],
            'shipping_class' => ['nullable', 'string', 'max:100'],
            'handling_time' => ['nullable', 'string', 'max:100'],
            'dispatch_time' => ['nullable', 'string', 'max:100'],
            'shipping_method' => ['nullable', 'string', 'max:100'],
            'estimated_delivery' => ['nullable', 'string', 'max:100'],
            'country_of_origin' => ['nullable', 'string', 'max:100'],
            'manufacturer_details' => ['nullable', 'string', 'max:5000'],
            'compliance_information' => ['nullable', 'string', 'max:5000'],
            'meta_title' => ['nullable', 'string', 'max:255'],
            'meta_description' => ['nullable', 'string', 'max:5000'],
            'seo_keywords' => ['nullable', 'string', 'max:5000'],
            'canonical_url' => ['nullable', 'url', 'max:500'],
            'images' => [$productId ? 'nullable' : 'required', 'array', 'min:1', 'max:12'],
            'images.*' => ['image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'youtube_urls' => ['nullable', 'array', 'max:10'],
            'youtube_urls.*' => ['nullable', 'url', 'max:500', 'regex:/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//i'],
            'videos' => ['nullable', 'array', 'max:6'],
            'videos.*' => ['file', 'mimes:mp4,webm,ogg,mov', 'max:51200'],
            'specification_name' => ['nullable', 'array'],
            'specification_name.*' => ['nullable', 'string', 'max:100'],
            'specification_value' => ['nullable', 'array'],
            'specification_value.*' => ['nullable', 'string', 'max:5000'],
            'tag' => ['nullable', 'array'],
            'tag.*' => ['nullable', 'string', 'max:50'],
            'included_item' => ['nullable', 'array'],
            'included_item.*' => ['nullable', 'string', 'max:255'],
            'variants' => ['nullable', 'array', 'max:100'],
            'variants.*.name' => ['required_with:variants', 'string', 'max:255'],
            'variants.*.sku' => ['required_with:variants', 'string', 'max:100', 'distinct'],
            'variants.*.price' => ['required_with:variants', 'numeric', 'min:0'],
            'variants.*.mrp' => ['nullable', 'numeric', 'min:0'],
            'variants.*.stock_quantity' => ['required_with:variants', 'integer', 'min:0'],
            'variants.*.color' => ['nullable', 'string', 'max:100'],
            'variants.*.size' => ['nullable', 'string', 'max:100'],
            'variants.*.storage' => ['nullable', 'string', 'max:100'],
            'variants.*.ram' => ['nullable', 'string', 'max:100'],
            'shipping' => ['nullable', 'array'],
            'shipping.package_weight' => ['nullable', 'numeric', 'min:0'],
            'shipping.length' => ['nullable', 'numeric', 'min:0'],
            'shipping.width' => ['nullable', 'numeric', 'min:0'],
            'shipping.height' => ['nullable', 'numeric', 'min:0'],
            'shipping.shipping_charge' => ['nullable', 'numeric', 'min:0'],
            'shipping.free_shipping_threshold' => ['nullable', 'numeric', 'min:0'],
            'shipping.delivery_locations' => ['nullable', 'string', 'max:5000'],
            'warranty' => ['nullable', 'array'],
            'warranty.available' => ['nullable', 'boolean'],
            'warranty.duration' => ['nullable', 'string', 'max:100'],
            'warranty.type' => ['nullable', 'string', 'max:100'],
            'warranty.provider' => ['nullable', 'string', 'max:255'],
            'warranty.description' => ['nullable', 'string', 'max:5000'],
            'return_policy' => ['nullable', 'array'],
            'return_policy.return_available' => ['nullable', 'boolean'],
            'return_policy.return_window' => ['nullable', 'integer', 'min:0'],
            'return_policy.replacement_available' => ['nullable', 'boolean'],
            'return_policy.refund_available' => ['nullable', 'boolean'],
            'return_policy.conditions' => ['nullable', 'string', 'max:5000'],
            'return_policy.non_returnable' => ['nullable', 'boolean'],
            'return_policy.shipping_responsibility' => ['nullable', 'string', 'max:100'],
            'tax' => ['nullable', 'array'],
            'tax.category' => ['nullable', 'string', 'max:100'],
            'tax.percentage' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'tax.hsn_sac_code' => ['nullable', 'string', 'max:100'],
            'tax.included_in_price' => ['nullable', 'boolean'],
        ]);
    }

    private function productData(Request $request, array $data, int $sellerId, bool $submit): array
    {
        $price = (float) $data['price'];
        $comparePrice = (float) $data['compare_price'];
        $status = $submit ? 'pending' : 'draft';

        return array_merge(collect($data)->except(['images', 'variants', 'specification_name', 'specification_value', 'tag', 'included_item', 'shipping', 'warranty', 'return_policy', 'tax'])->toArray(), [
            'seller_id' => $sellerId,
            'slug' => Str::slug($data['name']) . '-' . Str::lower(Str::random(6)),
            'title' => $data['title'],
            'price' => $price,
            'compare_price' => $comparePrice,
            'reserved_quantity' => $data['reserved_quantity'] ?? 0,
            'stock_status' => ($data['stock_quantity'] ?? 0) > 0 ? 'in_stock' : 'out_of_stock',
            'status' => $status,
            'approval_status' => $submit ? 'pending' : 'pending',
            'is_approved' => false,
            'is_active' => false,
        ]);
    }

    private function syncChildren(Request $request, Product $product): void
    {
        $product->variants()->delete();
        foreach ($request->input('variants', []) as $variant) {
            ProductVariant::create([
                'product_id' => $product->id,
                'name' => $variant['name'],
                'sku' => $variant['sku'],
                'price' => $variant['price'],
                'mrp' => $variant['mrp'] ?? null,
                'stock_quantity' => $variant['stock_quantity'],
                'stock_status' => ((int) $variant['stock_quantity']) > 0 ? 'in_stock' : 'out_of_stock',
                'color' => $variant['color'] ?? null,
                'size' => $variant['size'] ?? null,
                'storage' => $variant['storage'] ?? null,
                'ram' => $variant['ram'] ?? null,
            ]);
        }

        $product->specifications()->delete();
        foreach ($request->input('specification_name', []) as $index => $name) {
            $value = $request->input("specification_value.{$index}");
            if (filled($name) && filled($value)) {
                ProductSpecification::create(['product_id' => $product->id, 'name' => $name, 'value' => $value]);
            }
        }

        $product->tags()->delete();
        $tags = preg_split('/[,\n]+/', implode(',', $request->input('tag', [])), -1, PREG_SPLIT_NO_EMPTY);
        foreach (array_unique(array_filter(array_map('trim', $tags))) as $tag) {
            ProductTag::create(['product_id' => $product->id, 'name' => $tag]);
        }

        $product->includedItems()->delete();
        foreach (array_filter(array_map('trim', $request->input('included_item', []))) as $index => $item) {
            ProductIncludedItem::create(['product_id' => $product->id, 'name' => $item, 'sort_order' => $index]);
        }

        $product->shipping()->updateOrCreate([], $request->input('shipping', []));
        $product->warranty()->updateOrCreate([], $request->boolean('warranty.available') ? array_merge($request->input('warranty', []), ['available' => true]) : ['available' => false]);
        $product->returnPolicy()->updateOrCreate([], array_merge($request->input('return_policy', []), [
            'return_available' => $request->boolean('return_policy.return_available'),
            'replacement_available' => $request->boolean('return_policy.replacement_available'),
            'refund_available' => $request->boolean('return_policy.refund_available'),
            'non_returnable' => $request->boolean('return_policy.non_returnable'),
        ]));
        $product->tax()->updateOrCreate([], array_merge($request->input('tax', []), [
            'included_in_price' => $request->boolean('tax.included_in_price', true),
        ]));

        $existingVideoPaths = $product->videos()
            ->whereNotNull('video_path')
            ->pluck('video_path')
            ->all();

        $product->videos()->delete();
        foreach (array_filter($request->input('youtube_urls', [])) as $youtubeUrl) {
            ProductVideo::create([
                'product_id' => $product->id,
                'youtube_url' => $youtubeUrl,
            ]);
        }

        foreach ($existingVideoPaths as $videoPath) {
            ProductVideo::create([
                'product_id' => $product->id,
                'video_path' => $videoPath,
            ]);
        }

        foreach ($request->file('videos', []) as $video) {
            ProductVideo::create([
                'product_id' => $product->id,
                'video_path' => $video->store('product-videos', 'public'),
            ]);
        }
    }

    private function saveImages(Request $request, Product $product): void
    {
        foreach ($request->file('images', []) as $order => $image) {
            ProductImage::create([
                'product_id' => $product->id,
                'image_path' => $image->store('products', 'public'),
                'is_primary' => $order === 0,
                'order' => $order,
            ]);
        }
    }

    private function seller()
    {
        $seller = Auth::user()?->seller;
        abort_unless($seller, 403, 'Seller profile is not available.');

        return $seller;
    }

    private function authorizeProduct(Product $product): void
    {
        abort_unless($product->seller_id === $this->seller()->id, 403);
    }
}
