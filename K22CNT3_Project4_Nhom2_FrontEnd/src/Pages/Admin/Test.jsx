import { useForm, usePage } from '@inertiajs/react';
import React from 'react';

export default function Test() {
    const { data, setData, post, processing, errors, reset } = useForm({
        message: '',
    });

    const handleSend = (e) => {
        e.preventDefault();
        console.log('Form submitted, preventing default');
        post('/admin/test', {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                console.log('POST successful');
                reset('message');
            },
            onError: (errors) => {
                console.log('POST failed:', errors);
            },
            onFinish: () => {
                console.log('POST request finished');
            },
        });
    };

    return (
        <div>
            {/* Hiển thị thông báo thành công */}

            <form onSubmit={handleSend}>
                <input
                    type="text"
                    name="message"
                    id="message"
                    value={data.message}
                    onChange={(e) => setData('message', e.target.value)}
                />
                <button type="submit" disabled={processing}>
                    {processing ? 'Sending...' : 'Send'}
                </button>
            </form>
        </div>
    );
}