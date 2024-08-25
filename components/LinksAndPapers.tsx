import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import Select from 'react-select';
import { useAuth } from '../contexts/AuthContext';

interface LinkPaper {
  id: string;
  title: string;
  url?: string;
  attachmentUrl?: string;
  description: string;
  categories: string[];
}

interface Category {
  id: string;
  name: string;
}

const LinksAndPapers: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [linksPapers, setLinksPapers] = useState<LinkPaper[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newLink, setNewLink] = useState({ title: '', url: '', description: '', categories: [] });
  const [selectedCategories, setSelectedCategories] = useState<{ value: string; label: string }[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [showCategories, setShowCategories] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [categoryOptions, setCategoryOptions] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchLinksPapers();
      fetchCategories();
    }
  }, [isAuthenticated, user]);

  const fetchLinksPapers = async () => {
    const { data, error } = await supabase
      .from('linksPapers')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) console.error('Error fetching links/papers:', error);
    else setLinksPapers(data || []);
  };

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    if (error) console.error('Error fetching categories:', error);
    else {
      setCategories(data || []);
      setCategoryOptions(data?.map(cat => ({ value: cat.name, label: cat.name })) || []);
    }
  };

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert("You must be logged in to add a link/paper.");
      return;
    }
    let attachmentUrl = '';
    try {
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('papers')
          .upload(fileName, file);
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from('papers').getPublicUrl(fileName);
        attachmentUrl = data.publicUrl;
      }
      const { error } = await supabase.from('linksPapers').insert({
        ...newLink,
        categories: selectedCategories.map(cat => cat.value),
        attachmentUrl,
        user_id: user?.id
      });
      if (error) throw error;
      setNewLink({ title: '', url: '', description: '', categories: [] });
      setSelectedCategories([]);
      setFile(null);
      fetchLinksPapers();
    } catch (error) {
      console.error("Error adding link/paper:", error);
      alert("Failed to add link/paper. Please try again.");
    }
  };

  const handleDeleteLinkPaper = async (id: string) => {
    if (!isAuthenticated) {
      alert("You must be logged in to delete a link/paper.");
      return;
    }
    if (window.confirm('Are you sure you want to delete this link/paper?')) {
      const { error } = await supabase.from('linksPapers').delete().eq('id', id);
      if (error) console.error('Error deleting link/paper:', error);
      else fetchLinksPapers();
    }
  };

  const handleAddCategory = async () => {
    if (!isAuthenticated || !user) {
      alert("You must be logged in to add a category.");
      return;
    }
    if (!newCategory.trim()) return;
    const { error } = await supabase
      .from('categories')
      .insert({ 
        name: newCategory.trim(),
        user_id: user.id  // Add this line to include the user_id
      });
    if (error) console.error("Error adding category:", error);
    else {
      setNewCategory('');
      fetchCategories();
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!isAuthenticated) {
      alert("You must be logged in to delete a category.");
      return;
    }
    if (window.confirm('Are you sure you want to delete this category?')) {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) console.error('Error deleting category:', error);
      else fetchCategories();
    }
  };

  const filteredLinksPapers = useMemo(() => 
    filterCategory
      ? linksPapers.filter(item => item.categories.includes(filterCategory))
      : linksPapers,
    [linksPapers, filterCategory]
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Links and Papers</h2>
      
      {/* Add new link/paper form */}
      <form onSubmit={handleAddLink} className="space-y-4">
        <input
          type="text"
          value={newLink.title}
          onChange={(e) => setNewLink({...newLink, title: e.target.value})}
          placeholder="Title"
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="text"
          value={newLink.url}
          onChange={(e) => setNewLink({...newLink, url: e.target.value})}
          placeholder="URL (optional)"
          className="w-full p-2 border rounded"
        />
        <input
          type="file"
          onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
          className="w-full p-2 border rounded"
        />
        <textarea
          value={newLink.description}
          onChange={(e) => setNewLink({...newLink, description: e.target.value})}
          placeholder="Description"
          className="w-full p-2 border rounded"
          required
        />
        <div>
          <label className="block mb-2">Categories:</label>
          <Select
            isMulti
            options={categoryOptions}
            value={selectedCategories}
            onChange={(selected) => setSelectedCategories(selected as { value: string; label: string }[])}
            className="w-full"
          />
        </div>
        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Add Link/Paper
        </button>
      </form>

      {/* Category management */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold">Categories</h3>
          <span 
            className="text-blue-500 cursor-pointer text-sm"
            onClick={() => setShowCategories(!showCategories)}
          >
            {showCategories ? 'Hide' : 'Show'}
          </span>
        </div>
        {showCategories && (
          <div className="space-y-2">
            <div className="flex space-x-2">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="New Category"
                className="flex-grow p-2 border rounded"
              />
              <button onClick={handleAddCategory} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                Add
              </button>
            </div>
            <ul className="list-disc list-inside">
              {categories.map(category => (
                <li key={category.id} className="flex justify-between items-center">
                  <span>{category.name}</span>
                  <button 
                    onClick={() => handleDeleteCategory(category.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Filter */}
      <div>
        <label className="block mb-2">Filter by Category:</label>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="">All Categories</option>
          {categories.map(category => (
            <option key={category.id} value={category.name}>{category.name}</option>
          ))}
        </select>
      </div>

      {/* Display links and papers */}
      <div className="space-y-4">
        {filteredLinksPapers.map(item => (
          <div key={item.id} className="p-4 border rounded">
            <div className="flex justify-between items-start">
              <h3 className="text-xl font-semibold">{item.title}</h3>
              <button 
                onClick={() => handleDeleteLinkPaper(item.id)}
                className="text-red-500 hover:text-red-700"
              >
                Delete
              </button>
            </div>
            {item.url && (
              <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                {item.url}
              </a>
            )}
            {item.attachmentUrl && (
              <a href={item.attachmentUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                View Attachment
              </a>
            )}
            <pre className="whitespace-pre-wrap break-words mt-2 font-sans">{item.description}</pre>
            <div className="mt-2">
              {item.categories.map(category => (
                <span key={category} className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
                  {category}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LinksAndPapers;