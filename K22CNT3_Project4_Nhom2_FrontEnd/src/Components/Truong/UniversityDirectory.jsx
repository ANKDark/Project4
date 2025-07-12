const UniversityDirectory = ({ category }) => (
    <div className="card mb-4 text-color bg-details neon-glow">
        <div className=" card-body ">
            <strong className="fs-5">Danh mục:</strong>
            <p>
                {category ? category.CategoryName : "Không có danh mục"}
            </p>
        </div>
    </div>
);
export default UniversityDirectory;