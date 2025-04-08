import React, { useState, useEffect } from 'react';

const DanceLibrary: React.FC = () => {
  const [danceMotions, setDanceMotions] = useState([
    { id: 1, name: 'Pop Dance 1', category: 'Pop', favorite: false, previewImage: 'src/public/images/dance_pop1.png' },
    { id: 2, name: 'Hip Hop Dance 1', category: 'Hip Hop', favorite: true, previewImage: 'src/public/images/dance_hiphop1.png' },
    { id: 3, name: 'Ballet Dance 1', category: 'Ballet', favorite: false, previewImage: 'src/public/images/dance_ballet1.png' },
    { id: 4, name: 'Pop Dance 2', category: 'Pop', favorite: true, previewImage: 'src/public/images/dance_pop2.png' },
    { id: 5, name: 'Hip Hop Dance 2', category: 'Hip Hop', favorite: false, previewImage: 'src/public/images/dance_hiphop2.png' },
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categories, setCategories] = useState(['All', 'Pop', 'Hip Hop', 'Ballet']);

  useEffect(() => {
    // ダンスモーションのロードや初期化処理をここに追加
  }, []);

  const toggleFavorite = (id: number) => {
    setDanceMotions(danceMotions.map(motion =>
      motion.id === id ? { ...motion, favorite: !motion.favorite } : motion
    ));
  };

  const filteredMotions = danceMotions.filter(motion => {
    const searchMatch = motion.name.toLowerCase().includes(searchTerm.toLowerCase());
    const categoryMatch = selectedCategory === 'All' || motion.category === selectedCategory;
    return searchMatch && categoryMatch;
  });

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-md shadow-md max-w-4xl mx-auto mt-8">
      <Card className="w-full bg-card">
        <CardHeader className="bg-card">
          <CardTitle className="text-2xl font-bold bg-card">ダンスライブラリ</CardTitle>
          <CardDescription className="text-gray-500 bg-card">プリセットダンスモーションの管理、検索、お気に入り機能</CardDescription>
        </CardHeader>
        <CardContent className="bg-card">
          <div className="mb-4 flex items-center space-x-4">
            <Input
              type="text"
              placeholder="モーションを検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white dark:bg-gray-700 text-black dark:text-white"
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-white dark:bg-gray-700 text-black dark:text-white rounded-md p-2"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMotions.map(motion => (
              <div key={motion.id} className="bg-gray-100 dark:bg-gray-700 rounded-md p-4">
                <img src={motion.previewImage} alt={motion.name} width="100%" height="auto" style={{ maxHeight: '150px', objectFit: 'cover' }} />
                <h3 className="text-lg font-semibold mt-2 text-black dark:text-white">{motion.name}</h3>
                <p className="text-gray-600 dark:text-gray-400">カテゴリ: {motion.category}</p>
                <Button onClick={() => toggleFavorite(motion.id)} className="mt-2 bg-blue-500 text-white">
                  {motion.favorite ? 'お気に入り解除' : 'お気に入り'}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DanceLibrary;
