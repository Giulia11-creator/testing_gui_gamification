function ProductCard({ title, price, photo, onClick }) {
  return (
    <div
      className="rounded-lg border border-white-200 bg-white p-6 shadow-sm cursor-pointer"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick?.()}
    >
      <div className="h-56 w-full">
        <img className="mx-auto hidden h-full dark:block" src={photo} alt="" />
      </div>

      <div className="pt-6">
        {/* evita href="#" che “scrolla su” */}
        <div className="text-lg font-semibold leading-tight text-black-900">
          {title}
        </div>

        <div className="mt-4 flex items-center justify-between gap-4">
          <p className="text-2xl font-extrabold leading-tight text-black-900">
            {price}
          </p>
        </div>
      </div>
    </div>
  );
}
export default ProductCard;