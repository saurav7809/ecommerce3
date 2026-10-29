<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductApprovalHistory extends Model
{
    protected $table = 'product_approval_history';
    protected $fillable = ['product_id', 'reviewer_id', 'status', 'reason'];

    public function product() { return $this->belongsTo(Product::class); }
    public function reviewer() { return $this->belongsTo(User::class, 'reviewer_id'); }
}
