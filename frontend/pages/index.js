import { useEffect, useState } from 'react';

export default function Home() {
    const [products, setProducts] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true; // Prevent state updates if component is unmounted

        const fetchProducts = async () => {
            try {
                const response = await fetch('http://localhost:8080/products', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data = await response.json();
                console.log('Data received:', data);

                if (isMounted) {
                    setProducts(data);
                }
            } catch (err) {
                console.error('Error fetching data:', err);
                if (isMounted) {
                    setError('Failed to fetch products. Ensure the backend is running and accessible.');
                }
            }
        };

        fetchProducts();

        return () => {
            isMounted = false; // Cleanup function
        };
    }, []);

    return (
        <div>
            <h1>Warehouse Stock</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <ul>
                {products.map((product) => (
                    <li key={product.id}>
                        {product.name} - Stock: {product.stock}
                    </li>
                ))}
            </ul>
        </div>
    );
}
