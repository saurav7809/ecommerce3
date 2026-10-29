<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductApprovalHistory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $products = Product::with(['seller', 'category', 'brand', 'primaryImage'])
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
            ->paginate(20)
            ->withQueryString();

        return view('admin.products.index', compact('products'));
    }

    public function toggle(Product $product)
    {
        $product->update(['is_active' => ! $product->is_active, 'status' => $product->is_active ? 'inactive' : 'active']);

        return back()->with('success', $product->is_active ? 'Product activated.' : 'Product deactivated.');
    }

    public function destroy(Product $product)
    {
        $product->delete();

        return back()->with('success', 'Product moved to the recycle bin.');
    }

    public function update(Request $request, Product $product)
    {
        $data = $request->validate([
            'status' => ['required', Rule::in(['approved', 'rejected'])],
            'reason' => ['nullable', 'string', 'max:5000'],
        ]);

        abort_if($data['status'] === 'rejected' && blank($data['reason']), 422, 'A rejection reason is required.');

        DB::transaction(function () use ($request, $data, $product) {
            $approved = $data['status'] === 'approved';
            $product->update([
                'status' => $approved ? 'active' : 'rejected',
                'approval_status' => $data['status'],
                'is_approved' => $approved,
                'is_active' => $approved,
                'rejection_reason' => $approved ? null : $data['reason'],
            ]);
            ProductApprovalHistory::create([
                'product_id' => $product->id,
                'reviewer_id' => $request->user()->id,
                'status' => $data['status'],
                'reason' => $data['reason'] ?? null,
            ]);
        });

        return back()->with('success', $data['status'] === 'approved' ? 'Product approved and published.' : 'Product rejected with feedback.');
    }
}
