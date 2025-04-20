
export const AdditionalInfoSection = () => {
  // Static info blocks
  const infoBlocks = [
    {
      id: "1",
      title: "Toner Cartridges",
      content: "Used in laser printers, toner cartridges contain a fine powder that is fused to the paper with heat. They typically offer higher page yields and are more cost-effective for high-volume printing."
    },
    {
      id: "2",
      title: "Ink Cartridges",
      content: "Found in inkjet printers, these cartridges contain liquid ink that is sprayed onto the paper. They're ideal for color-rich documents and photos, offering vibrant color reproduction."
    },
    {
      id: "3",
      title: "Drum Units",
      content: "An essential component in laser printing, drum units transfer toner to the paper. Some printers have integrated drum-toner cartridges, while others require separate replacement drums."
    }
  ];
  
  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-xl shadow-sm p-8 mb-10 transform transition-all duration-500 hover:shadow-md">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-techblue-700">
            Why Choose TechPinoy As Your Toner Cartridge Supplier?
          </h2>
          
          <div className="space-y-4">
            <p className="text-gray-700 text-base md:text-lg">
              At TechPinoy, we understand that businesses and individuals alike need reliable, high-quality printer supplies that won't break the bank. That's why we've dedicated ourselves to providing premium compatible toner cartridges that deliver exceptional performance at prices up to 70% lower than OEM products.
            </p>
            <p className="text-gray-700 text-base md:text-lg">
              Our commitment to excellence extends beyond just offering great products. We provide comprehensive customer support, fast shipping, and a satisfaction guarantee that ensures you'll always be happy with your purchase.
            </p>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-8 transform transition-all duration-500 hover:shadow-md">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-techblue-700">
            Know Your Printer Ink, Toner & Drum Cartridges Better
          </h2>
          
          <div className="space-y-6">
            <p className="text-gray-700 text-base md:text-lg">
              Understanding the differences between printer consumables can help you make better purchasing decisions and extend the life of your printing equipment. Here's a quick guide to the main types of printer supplies we offer:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              {infoBlocks.map((block, index) => (
                <div key={block.id} className={`${
                  index === 0 ? "bg-techblue-50" : 
                  index === 1 ? "bg-techpinoy-50" : 
                  "bg-teal-50"
                } p-6 rounded-lg`}>
                  <h3 className={`font-bold text-lg ${
                    index === 0 ? "text-techblue-700" : 
                    index === 1 ? "text-techpinoy-700" : 
                    "text-teal-700"
                  } mb-3`}>{block.title}</h3>
                  <p className="text-gray-700">
                    {block.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
