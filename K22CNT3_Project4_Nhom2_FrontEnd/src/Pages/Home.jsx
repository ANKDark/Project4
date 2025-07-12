import React, { useState, useEffect } from 'react';
import MainLayout from '../Layouts/MainLayout';
import SearchBox from '../Components/SearchBox';
import UniversityList from '../Components/Truong/UniversityList';
import '../assets/css/HomeUnv.css';
import ListBox from '@/Components/ListBox';
import Carousel from '@/Components/Truong/Carousel';

export default function Home() {
  const [truongs, setTruongs] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [minScore, setMinScore] = useState('');
  const [maxScore, setMaxScore] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/home')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        setTruongs(data.truongs || []);
        setTopRated(data.topRated || []);
        setLoading(false);
      })
      .catch(error => {
        console.error('Lỗi khi gọi API:', error);
        setError(error.message);
        setLoading(false);
      });
  }, []);

  const categories = [...new Set(truongs.map(t => t.category?.CategoryName).filter(Boolean))];

  const ratedTruongImg = topRated
    .map(item => {
      const matchedTruong = truongs.find(t => t.Id === item.IdTruong);
      return matchedTruong ? matchedTruong.Img : null;
    })
    .filter(Img => Img !== null);

  const handleSearch = (e) => {
    const value = e.target.value;
    setKeyword(value);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const filteredTruong = truongs.filter(t => {
    const avgScore = parseFloat(topRated.find(r => r.IdTruong === t.Id)?.average_rating || 0);
    const effectiveMinScore = minScore ? parseFloat(minScore) : 0;
    const effectiveMaxScore = maxScore ? parseFloat(maxScore) : 5;
    const matchesScore = avgScore >= effectiveMinScore && avgScore <= effectiveMaxScore;
    const matchesCategory = selectedCategory
      ? t.category?.CategoryName === selectedCategory
      : true;

    return matchesScore && matchesCategory;
  });

  return (
    <MainLayout>
      <h1 className="text-center mt-4 fw-bold fs-2 text-uppercase text-white neon-text">
        Danh sách Trường Đại học
      </h1>

      {loading && <p className="text-center text-white">Đang tải dữ liệu...</p>}
      {error && <p className="text-center text-danger">Lỗi: {error}</p>}

      {!loading && !error && (
        <>
          <Carousel images={ratedTruongImg} truongs={truongs} />
          <div className="search-list-container d-flex flex-column align-items-center">
            <SearchBox
              placeholder="Tìm kiếm trường..."
              value={keyword}
              onChange={handleSearch}
              className="search-home-unv"
            />

            {keyword && (
              <div className="w-100 mt-1 listbox-transition">
                <ListBox
                  valueName="TenTruong"
                  table={truongs}
                  keyword={keyword}
                />
              </div>
            )}
          </div>

          <div className="filter-bar d-flex justify-content-end align-items-center gap-3 flex-wrap w-100 mt-3 mb-3">
            <div className="d-flex align-items-center gap-3 flex-wrap">
              <div className="d-flex align-items-center gap-2">
                <label className="text-white mb-0">
                  Điểm tối thiểu: {minScore || '0'} <i className="fa-solid fa-star text-warning"></i>
                </label>
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="0.5"
                  value={minScore}
                  onChange={(e) => setMinScore(e.target.value)}
                  className="form-range input-min-score"
                  style={{ width: '150px' }}
                />
              </div>

              <div className="d-flex align-items-center gap-2">
                <label className="text-white mb-0">
                  Điểm tối đa: {maxScore || '5'} <i className="fa-solid fa-star text-warning"></i>
                </label>
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="0.5"
                  value={maxScore}
                  onChange={(e) => setMaxScore(e.target.value)}
                  className="form-range input-max-score"
                  style={{ width: '150px' }}
                />
              </div>

              <div>
                <select
                  value={selectedCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="select-category form-select"
                  style={{ width: '200px' }}
                >
                  <option value="">Tất cả danh mục</option>
                  {categories.map((category, index) => (
                    <option key={index} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="row mt-4">
            {filteredTruong.map(t => (
              <UniversityList
                key={t.Id}
                image={`http://127.0.0.1:8000${t.Img}`}
                name={t.TenTruong}
                year={t.NamThanhLap}
                description={t.MoTaTruong}
                sumRatingUnv={topRated}
                id={t.Id}
                averageRating={topRated.find(r => r.IdTruong === t.Id)?.average_rating || 'Chưa có đánh giá'}
              />
            ))}
          </div>
        </>
      )}
    </MainLayout>
  );
}