import React, { useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import SearchBox from '../Components/SearchBox';
import UniversityList from '../Components/Truong/UniversityList';
import '../../css/HomeUnv.css';
import ListBox from '@/Components/ListBox';
import { Head } from '@inertiajs/react';
import Carousel from '@/Components/Truong/Carousel';

export default function Home({ truong, currentUserId, sumRatingUnv }) {
  const [keyword, setKeyword] = useState('');

  const ratedTruongImg = sumRatingUnv
    .map(item => {
      const matchedTruong = truong.find(t => t.Id === item.IdTruong);
      return matchedTruong ? matchedTruong.Img : null;
    })
    .filter(Img => Img !== null);

  const handleSearch = (e) => {
    const value = e.target.value;
    setKeyword(value);
    console.log('Searching for:', value);
  };

  return (
    <MainLayout>
      <Head title="Trang chủ" />
      <h1 className="text-center mt-4 fw-bold fs-2 text-uppercase text-white">
        Danh sách Trường Đại học
      </h1>
      <Carousel
        images={ratedTruongImg}
        truong={truong}
      />
      <div className="search-list-container d-flex flex-column align-items-center">
        <SearchBox
          placeholder="Tìm kiếm trường..."
          value={keyword}
          onChange={handleSearch}
          className="search-home-unv"
        />

        {keyword && (
          <div className="w-100 mt-1">
            <ListBox
              valueName="TenTruong"
              table={truong}
              keyword={keyword}
            />
          </div>
        )}
      </div>
      <div className="row mt-4">
        {truong.map(t => (
          <UniversityList
            key={t.Id}
            image={t.Img}
            name={t.TenTruong}
            year={t.NamThanhLap}
            description={t.MoTaTruong}
            id={t.Id}
          />
        ))}
      </div>
    </MainLayout>
  );
}
