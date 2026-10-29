<?php

namespace Tests\Feature;

use Tests\TestCase;

class GuestCartCheckoutRedirectTest extends TestCase
{
    public function test_guest_is_redirected_to_register_when_trying_to_add_to_cart(): void
    {
        $response = $this->postJson('/customer/cart/add', [
            'product_id' => 999,
            'quantity' => 1,
        ]);

        $response->assertStatus(401)
            ->assertJsonPath('redirect_to', route('register'))
            ->assertJsonPath('message', 'Please register to add items to your cart.');
    }

    public function test_guest_is_redirected_to_register_when_trying_to_checkout(): void
    {
        $response = $this->get('/customer/checkout');

        $response->assertRedirect(route('register'));
    }
}
