<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductVideo extends Model
{
    protected $fillable = ['product_id', 'youtube_url', 'video_path', 'thumbnail_path'];

    public function getEmbedUrlAttribute(): ?string
    {
        if (!$this->youtube_url) {
            return null;
        }

        $path = parse_url($this->youtube_url, PHP_URL_PATH) ?: '';
        $query = [];
        parse_str((string) parse_url($this->youtube_url, PHP_URL_QUERY), $query);
        $videoId = $query['v'] ?? trim($path, '/');

        if (str_contains($path, '/shorts/')) {
            $videoId = last(explode('/shorts/', $path));
        }

        return $videoId ? 'https://www.youtube.com/embed/' . basename($videoId) : null;
    }

    public function getVideoUrlAttribute(): ?string
    {
        return $this->video_path ? asset('storage/' . ltrim($this->video_path, '/')) : null;
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
