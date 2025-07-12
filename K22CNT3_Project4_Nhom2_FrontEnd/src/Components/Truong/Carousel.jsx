import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';

const Carousel = ({ images, truongs }) => {
  return (
    <div className="mt-5 carousel-neon-glow">
      <Swiper
        modules={[Autoplay]}
        spaceBetween={20}
        slidesPerView={1}
        loop={images && images.length > 1}
        autoplay={{ delay: 2000 }}
        speed={800}
        grabCursor={true}
        className="rounded overflow-hidden"
      >
        {images && truongs && images.length > 0 && truongs.length > 0 ? (
          images.map((image, index) => {
            const matchedTruong = truongs.find(t => t.Img === image) || {};
            const truongId = matchedTruong.Id || null;
            const imageUrl = image
              ? `http://127.0.0.1:8000${image}`
              : '/images/default.jpg';

            return (
              <SwiperSlide key={index}>
                <a href={truongId ? `/details/${truongId}` : '#'}>
                  <img
                    src={imageUrl}
                    alt={matchedTruong.TenTruong || `Image ${index + 1}`}
                    className="w-full max-h-[400px] object-cover rounded"
                  />
                </a>
              </SwiperSlide>
            );
          })
        ) : (
          <SwiperSlide>
            <p className="text-center text-white">Không có dữ liệu để hiển thị</p>
          </SwiperSlide>
        )}
      </Swiper>
    </div>
  );
};

export default Carousel;
