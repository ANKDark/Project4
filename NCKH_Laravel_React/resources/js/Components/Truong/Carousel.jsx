import React from 'react';
import { Link } from '@inertiajs/react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';

import 'swiper/css';

const Carousel = ({ images, truong }) => {
  return (
    <div className="mt-5">
      <Swiper
        modules={[Autoplay]}
        spaceBetween={20}
        slidesPerView={1}
        loop={true}
        autoplay={{ delay: 3000 }}
        className="rounded overflow-hidden"
      >
        {images.map((image, index) => {
          const matchedTruong = truong.find(t => t.Img === image);
          const truongId = matchedTruong ? matchedTruong.Id : null;

          return (
            <SwiperSlide key={index}>
              <Link href={`/details/${truongId}`}>
                <img
                  src={image}
                  alt={`Image ${index + 1}`}
                  className="w-full max-h-[400px] object-cover rounded"
                />
              </Link>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
};

export default Carousel;
