const renderAboutPage = () => `
  <div class="h-24 z-50 relative container mx-auto px-6 grid grid-cols-3">
    <div class="flex items-center">
      <div class="h-24 z-50 relative container mx-auto px-6 grid grid-cols-3">
        <div class="flex items-center">
          <div class="font-bold text-2xl">
            <h1><a href="https://www.dispatch.bio">Dispatch</a></h1>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="w-full h-24 bg-[#1d1d1f] bg-opacity-95 absolute top-0 left-0"></div>
  <div class="relative h-96">
    <img src="https://images.unsplash.com/photo-1635830625698-3b9bd74671ca?auto=format&q=20&w=2664&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1960&q=80" class="w-full h-full object-cover" />
  </div>
  <div class="max-w-4xl mx-auto bg-white py-12 px-12 lg:px-24 -mt-32 relative z-10">
    <h2 class="mt-4 uppercase tracking-widest text-xs text-gray-600">About Dispatch</h2>
    <h1 class="font-display text-2xl md:text-3xl text-gray-900 mt-4">The creator economy is just getting started</h1>
    <div class="prose prose-sm sm:prose lg:prose-lg mt-6 text-gray-800">
      <p>Established in 2023, Dispatch was built with a straightforward purpose: to help web3 content creators make a sustainable living from their work. At Dispatch, we recognize you not merely as an artist, but as an entrepreneur, continually creating and financing new projects.</p>
      <br />
      <ul>
        <li class="mb-4"><strong>Tap into web3:</strong> The web3 community is well capitalised and has strong convictions. Projects that fit their interests can potentially raise a lot of funds.</li>
        <li class="mb-4"><strong>Fair Revenue Split:</strong> We believe in a transparent financial model. While we retain just 8% to support the platform, you take home a solid 92% of your fundraised amount.</li>
        <li class="mb-4"><strong>Seamless Integration:</strong> Your content is unequivocally yours. With Dispatch, you can effortlessly integrate your fundraising page on any service, expanding your reach and maintaining control.</li>
      </ul>
    </div>
  </div>
  <div class="bg-gray-900 text-white text-opacity-40 font-semibold uppercase text-xs tracking-widest bg-opacity-80 px-12">
    <div class="container mx-auto grid grid-cols-1 lg:grid-cols-4 gap-12 text-center lg:text-left py-12">
      <div>
        <div class="font-display text-white uppercase text-sm tracking-widest mb-6">Helpful Links</div>
        <a href="https://www.dispatch.bio/about" class="block mb-4">About</a>
        <a href="https://twitter.com/web3pushers" class="block mb-4">Twitter</a>
        <a href="https://www.dispatch.bio" class="block mb-4">Dispatch.bio</a>
      </div>
      <div>
        <div class="font-display text-white uppercase text-sm tracking-widest mb-6">More</div>
        <a href="https://www.dispatch.bio/about" class="block mb-4">Contract</a>
        <a href="https://twitter.com/web3pushers" class="block mb-4">Github</a>
      </div>
    </div>
    <div class="text-sm lg:text-base text-center font-heading font-light tracking-widest uppercase text-white opacity-75 pb-24">©2023 Dispatch</div>
  </div>
`;

const handleRequest = (req: any, res: any) => {
  const fullHtml = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <link rel="icon" type="image/svg+xml" href="https://www.dispatch.bio/favicon.png" />
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>About Dispatch</title>
        <meta name="description" content="Learn more about Dispatch, a web3-based service for content creators.">
        <!-- Additional meta tags and SEO-optimized content can be added here -->
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/tailwindcss/2.2.19/tailwind.min.css" referrerpolicy="no-referrer" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/daisyui/3.9.3/full.min.css" integrity="sha512-6FI+LYzXdRf6DgfKUMGkfl8+vG9EPB8qiylC8PrdDRATHv8J9qgmID03FVPg4c62ZJNrcIIMQ0/5n6KtfFUWYQ==" crossorigin="anonymous" referrerpolicy="no-referrer" />
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;800&display=swap" rel="stylesheet">
      </head>
      <body>
        <style>
          body {
            font-family: Nunito,sans-serif;
          }
        </style>
        ${renderAboutPage()}
      </body>
    </html>
  `;

  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');
  res.setHeader('Cache-Control', 'public, max-age=86400');

  res.end(fullHtml);
};

module.exports = handleRequest;
