<?php

use App\Models\User;

test('hiển thị được màn hình đăng nhập', function () {
    $phanHoi = $this->get('/login');

    $phanHoi->assertStatus(200);
});

test('người dùng có thể đăng nhập với thông tin đúng', function () {
    $nguoiDung = User::factory()->create();

    $phanHoi = $this->post('/login', [
        'email' => $nguoiDung->email,
        'password' => 'password',
    ]);

    $this->assertAuthenticated();

    $phanHoi->assertRedirect(route('index', absolute: false));
});

test('người dùng không thể đăng nhập với mật khẩu sai', function () {
    $nguoiDung = User::factory()->create();

    $this->post('/login', [
        'email' => $nguoiDung->email,
        'password' => 'sai-mat-khau',
    ]);

    $this->assertGuest();
});

test('người dùng có thể đăng xuất', function () {
    $nguoiDung = User::factory()->create();

    $phanHoi = $this->actingAs($nguoiDung)->post('/logout');

    $this->assertGuest();

    $phanHoi->assertRedirect('/');
});
