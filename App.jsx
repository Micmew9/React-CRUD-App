import { useState, useEffect } from "react";
import "./App.css";

import { db } from "./firebaseConfig";
import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, addDoc, onSnapshot } from "firebase/firestore";

function App() {
  const [count, setCount] = useState(0);
  const [docRef, setDocRef] = useState(null);
  
  // New inventory management state
  const [items, setItems] = useState([]);
  const [itemName, setItemName] = useState("");
  const [itemQuantity, setItemQuantity] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");

  const testDocRef = doc(db, "test", "single-document");
  const itemsCollectionRef = collection(db, "inventory");

  // Original counter functionality
  useEffect(() => {
    const loadDocument = async () => {
      try {
        const docSnap = await getDoc(testDocRef);
        if (docSnap.exists()) {
          setCount(docSnap.data().count || 0);
          setDocRef(testDocRef);
        } else {
          await setDoc(testDocRef, { uid: "test", createdAt: new Date(), count: 0 });
          setCount(0);
          setDocRef(testDocRef);
        }
      } catch (error) {
        console.error("Error loading document:", error);
      }
    };

    loadDocument();
  }, []);

  // Real-time listener for inventory items
  useEffect(() => {
    const unsubscribe = onSnapshot(itemsCollectionRef, (snapshot) => {
      setItems(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    });

    return () => unsubscribe();
  }, []);

  // Original counter update
  useEffect(() => {
    if (!docRef) return;
    const updateCount = async () => {
      try {
        await updateDoc(docRef, { count });
      } catch (error) {
        console.error("Error updating count:", error);
      }
    };
    updateCount();
  }, [docRef, count]);

  const handleDelete = async () => {
    if (!docRef) return;
    try {
      await deleteDoc(docRef);
      setCount(0);
      setDocRef(null);
      console.log("Document deleted successfully");
    } catch (error) {
      console.error("Error deleting document:", error);
    }
  };

  // New inventory management functions
  const addItem = async () => {
    if (!itemName.trim()) {
      setError("Please enter an item name");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      await addDoc(itemsCollectionRef, { 
        name: itemName.trim(), 
        quantity: Math.max(0, itemQuantity),
        createdAt: new Date()
      });
      setItemName("");
      setItemQuantity(0);
    } catch (err) {
      setError("Failed to add item: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateItemQuantity = async (id, newQuantity) => {
    if (newQuantity < 0) return;
    
    try {
      const itemDoc = doc(db, "inventory", id);
      await updateDoc(itemDoc, { quantity: newQuantity });
    } catch (err) {
      setError("Failed to update quantity: " + err.message);
    }
  };

  const updateItemName = async (id, newName) => {
    if (!newName.trim()) return;
    
    try {
      const itemDoc = doc(db, "inventory", id);
      await updateDoc(itemDoc, { name: newName.trim() });
      setEditingId(null);
      setEditingName("");
    } catch (err) {
      setError("Failed to update name: " + err.message);
    }
  };

  const deleteItem = async (id) => {
    try {
      const itemDoc = doc(db, "inventory", id);
      await deleteDoc(itemDoc);
    } catch (err) {
      setError("Failed to delete item: " + err.message);
    }
  };

  const startEditing = (id, currentName) => {
    setEditingId(id);
    setEditingName(currentName);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingName("");
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addItem();
    }
  };

  const handleEditKeyDown = (e, id) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      updateItemName(id, editingName);
    } else if (e.key === 'Escape') {
      cancelEditing();
    }
  };

  return (
    <>
      <h1>Firebase CRUD Demo App</h1>
      
      {/* Original Counter Section */}
      <div className="card">
        <h2>Simple Counter (Original)</h2>
        <button onClick={() => setCount((c) => c + 1)}>count is {count}</button>
        <button onClick={handleDelete}>Delete Counter Document</button>
      </div>

      {/* Enhanced Inventory Management Section */}
      <div className="card">
        <h2>Firebase CRUD Inventory Demo</h2>
        
        {error && (
          <div style={{
            backgroundColor: '#ffebee',
            border: '1px solid #ffcdd2',
            color: '#c62828',
            padding: '12px',
            borderRadius: '4px',
            marginBottom: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            {error}
            <button 
              onClick={() => setError("")}
              style={{
                background: 'none',
                border: 'none',
                color: '#c62828',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              ×
            </button>
          </div>
        )}
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
          <input
            type="text"
            placeholder="Item name (e.g., 'Laptops', 'Apples', 'Books')"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            style={{
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
          
          <input
            type="number"
            placeholder="Quantity"
            value={itemQuantity}
            onChange={(e) => setItemQuantity(Number(e.target.value))}
            onKeyDown={handleKeyDown}
            min="0"
            disabled={loading}
            style={{
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
          
          <button 
            onClick={addItem}
            disabled={loading || !itemName.trim()}
            style={{
              padding: '10px',
              backgroundColor: loading || !itemName.trim() ? '#ccc' : '#2196f3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading || !itemName.trim() ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? "Adding..." : "Add Item to Inventory"}
          </button>
        </div>
        
        {items.length > 0 ? (
          <div>
            <h3>Current Inventory ({items.length} items)</h3>
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {items.map((item) => (
                <div key={item.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 0',
                  borderBottom: '1px solid #eee'
                }}>
                  <div style={{ flex: 1 }}>
                    {editingId === item.id ? (
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={(e) => handleEditKeyDown(e, item.id)}
                        onBlur={() => updateItemName(item.id, editingName)}
                        autoFocus
                        style={{
                          padding: '4px 8px',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          fontSize: '14px'
                        }}
                      />
                    ) : (
                      <span 
                        onClick={() => startEditing(item.id, item.name)}
                        style={{ 
                          cursor: 'pointer',
                          fontWeight: '500'
                        }}
                        title="Click to edit name"
                      >
                        {item.name}
                      </span>
                    )}
                    <span style={{ marginLeft: '8px', color: '#666' }}>
                      - Qty: {item.quantity}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button 
                      onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: '#4caf50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                      title="Increase quantity"
                    >
                      +1
                    </button>
                    <button 
                      onClick={() => updateItemQuantity(item.id, Math.max(0, item.quantity - 1))}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: '#ff9800',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                      title="Decrease quantity"
                    >
                      -1
                    </button>
                    <button 
                      onClick={() => deleteItem(item.id)}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: '#f44336',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                      title="Delete item"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', fontStyle: 'italic', color: '#999', padding: '20px' }}>
            <p>No items in inventory</p>
            <p style={{ fontSize: '12px', marginTop: '8px' }}>
              Add your first item above to get started!
            </p>
          </div>
        )}
        
        <p style={{ fontSize: '12px', color: '#999', marginTop: '16px' }}>
          💡 Tip: Click on item names to edit them, use +/- to adjust quantities
        </p>
      </div>
    </>
  );
}

export default App;