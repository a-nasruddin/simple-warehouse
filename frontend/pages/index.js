import { useEffect, useState } from 'react';

export default function Home() {
    const [products, setProducts] = useState([]);
    const [error, setError] = useState(null);
    const [isAdding, setIsAdding] = useState(false); // State untuk form tambah data
    const [editingProduct, setEditingProduct] = useState(null); // State untuk form update data
    const [name, setName] = useState('');
    const [stock, setStock] = useState('');
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    // Ambil data produk dari backend
    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await fetch('http://localhost:8080/products');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setProducts(data);
        } catch (error) {
            console.error('Error fetching data:', error);
            setError('Failed to fetch products. Please check if the backend is running.');
        }
    };

    // Handle tambah data
    const handleAddProduct = async (e) => {
        e.preventDefault();

        const newProduct = { name, stock: parseInt(stock) };

        const response = await fetch('http://localhost:8080/products', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newProduct),
        });

        if (response.ok) {
            const data = await response.json();
            setProducts([...products, data]); // Tambahkan produk baru ke state
            setIsAdding(false); // Sembunyikan form tambah data
            setName('');
            setStock('');
        }
    };

    // Handle update data
    const handleUpdateProduct = async (e) => {
        e.preventDefault();

        const updatedProduct = { id: editingProduct.id, name, stock: parseInt(stock) };

        const response = await fetch(`http://localhost:8080/products/${editingProduct.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedProduct),
        });

        if (response.ok) {
            const data = await response.json();
            setProducts(products.map((p) => (p.id === data.id ? data : p))); // Update produk di state
            setEditingProduct(null); // Sembunyikan form update data
            setName('');
            setStock('');
        }
    };

    // Handle hapus data
    const handleDeleteProduct = async (id) => {
        const response = await fetch(`http://localhost:8080/products/${id}`, {
            method: 'DELETE',
        });

        if (response.ok) {
            setProducts(products.filter((p) => p.id !== id)); // Hapus produk dari state
        }
    };

    // Handle tombol edit
    const handleEditClick = (product) => {
        setEditingProduct(product);
        setName(product.name);
        setStock(product.stock);
    };

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">Warehouse Stock</h1>
            {error && <p className="text-red-500">{error}</p>}

            {/* Tampilkan form tambah atau update data */}
            {isAdding || editingProduct ? (
                <form onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct} className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">
                        {editingProduct ? 'Update Product' : 'Add New Product'}
                    </h2>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">Stock</label>
                        <input
                            type="number"
                            value={stock}
                            onChange={(e) => setStock(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg"
                            required
                        />
                    </div>
                    <button type="submit" className="bg-blue-500 text-white p-2 rounded-lg mr-2">
                        {editingProduct ? 'Update' : 'Add'}
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setIsAdding(false);
                            setEditingProduct(null);
                            setName('');
                            setStock('');
                        }}
                        className="bg-gray-500 text-white p-2 rounded-lg"
                    >
                        Cancel
                    </button>
                </form>
            ) : (
                <button
                    onClick={() => setIsAdding(true)}
                    className="bg-blue-500 text-white p-2 rounded-lg mb-4"
                >
                    Add New Product
                </button>
            )}

            {/* Tampilkan daftar produk */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                    <div key={product.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                        <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
                        <p className="text-gray-600">ID: {product.id}</p>
                        <p className="text-gray-600">Stock: {product.stock}</p>
                        <div className="mt-4">
                            <button
                                onClick={() => handleEditClick(product)}
                                className="bg-yellow-500 text-white p-2 rounded-lg mr-2"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => handleDeleteProduct(product.id)}
                                className="bg-red-500 text-white p-2 rounded-lg"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}