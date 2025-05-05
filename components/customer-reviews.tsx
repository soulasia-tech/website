import { useEffect } from "react";

export function CustomerReviews() {
  useEffect(() => {
    // Only add the script if it hasn't been added yet
    if (!document.querySelector('script[src="https://static.elfsight.com/platform/platform.js"]')) {
      const script = document.createElement("script");
      script.src = "https://static.elfsight.com/platform/platform.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  return (
    <div className="max-w-5xl mx-auto py-12">
      <h2 className="text-3xl font-bold text-center mb-8">What Our Guests Say</h2>
      <div className="elfsight-app-b6e0f7e5-21ef-4db4-a42d-f02a49cc25f3" data-elfsight-app-lazy></div>
    </div>
  );
}

export default CustomerReviews; 