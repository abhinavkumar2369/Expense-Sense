const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="h-10 w-10 rounded-full border-4 border-brand-100 border-t-brand-700 animate-spin" />
    </div>
  );
};

export default LoadingSpinner;
