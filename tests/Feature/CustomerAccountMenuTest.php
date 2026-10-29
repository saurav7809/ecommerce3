<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CustomerAccountMenuTest extends TestCase
{
    use RefreshDatabase;

    public function test_logged_in_customer_sees_account_menu(): void
    {
        $user = User::factory()->create([
            'first_name' => 'Sumit',
            'last_name' => 'Sharma',
            'email' => 'sumit@example.com',
            'password' => 'password123',
        ]);

        $response = $this->actingAs($user)->get(route('home'));

        $response->assertOk()
            ->assertSee('Your Account')
            ->assertSee('My Profile')
            ->assertSee('Saved Addresses')
            ->assertSee('Logout');
    }
}
