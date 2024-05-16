'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "assets/AssetManifest.json": "3c6d05ae64084d5d1dac6d8ee4455224",
"assets/assets/fonts/Stilu-Bold.otf": "3fad1f196137debc9eed11176f19ea6f",
"assets/assets/fonts/Stilu-BoldOblique.otf": "7bde6dd73552656f465efad2f2b5806a",
"assets/assets/fonts/Stilu-Light.otf": "0d2dfd54112541fe47ff479838203fb3",
"assets/assets/fonts/Stilu-LightOblique.otf": "94de2f79c75d243df8c58d934151620a",
"assets/assets/fonts/Stilu-Oblique.otf": "582ee19c2b654e45d739e18f0afdd2af",
"assets/assets/fonts/Stilu-Regular.otf": "40e067a4de1cd5b905aeb100b8dfb9b9",
"assets/assets/fonts/Stilu-SemiBold.otf": "5934a89ae942ca375872c0e7f5c8d6ff",
"assets/assets/fonts/Stilu-SemiBoldOblique.otf": "9e17b9544485c1bc1178207358a8aa1c",
"assets/assets/images/amazon.png": "f584a9fc2873c2ea6579562ae1af25e6",
"assets/assets/images/bg.png": "74ee50e9a35e0a8989d6ff6715d4961a",
"assets/assets/images/bg.svg": "9501ce461caed148b59e7f0cda2efde3",
"assets/assets/images/calm.png": "cf69f2059daed2d109255acb66e88ccd",
"assets/assets/images/check.png": "1bc0cfc5136897f58e00cef4186a4578",
"assets/assets/images/chocolates.png": "aced7a3e7c7b90c34a00a6fa526d745a",
"assets/assets/images/chocolates.svg": "a59bb5a1f1e89c26fd7a420a2ac143b3",
"assets/assets/images/crown.png": "7beeb4faff18fd5ab396ea0cfbe08084",
"assets/assets/images/crown.svg": "a794eaf3ef87cf0f85e1e1489e04b1cb",
"assets/assets/images/done.png": "ba24ce731989a7ebd9a6ccc714558736",
"assets/assets/images/fitbit.png": "251bfa9c3dcfa10f31fe433468008b65",
"assets/assets/images/gift.png": "aa11f8d5ca6a7cd3c438df6ac9268d57",
"assets/assets/images/gift_big.png": "a9b6d4f35be71bc2b7e7edd3a741785d",
"assets/assets/images/healthquestion.png": "740f67756df071f503b09f1612350f7d",
"assets/assets/images/heart.gif": "aaf87c60003257945fcb177f711bf0a7",
"assets/assets/images/heart.png": "9f075d77900eadbdcc7ab117033f8e3e",
"assets/assets/images/home-active.svg": "3ea231fed1c4b90c532f08b704b852d2",
"assets/assets/images/home.svg": "dfd24ce01c13b0e5ec6e72c3d051c93f",
"assets/assets/images/left-arrow.png": "071a48f9067e9489b845a650c55003df",
"assets/assets/images/login-picture.png": "6bd7f93e1fc1daa4abdd6bffb2a889cb",
"assets/assets/images/Logo.svg": "62bced290268dc8ecc4799fcc20ea2e0",
"assets/assets/images/map.png": "9428269ac4b07e8a3240ffcd7f11918b",
"assets/assets/images/map.svg": "29def77d5c7046a5c479455eb504d855",
"assets/assets/images/moods/1.png": "212a387a9263ecb8e46d712bade1bdef",
"assets/assets/images/moods/2.png": "2e3fcba1829c3e73aa00206f174c7b29",
"assets/assets/images/moods/3.png": "e22d17ec1c1db78decdbced355f43daa",
"assets/assets/images/moods/4.png": "27b477b7e22bd6745f9dc0a29074ed2a",
"assets/assets/images/moods/5.png": "9db52133ccb4d7da282c44a9454838e5",
"assets/assets/images/moods/back-no.png": "555189151cc01318b97a72c7fdca55fa",
"assets/assets/images/moods/back-yes.png": "5e5a331a0fc557b14a51e5b94e381861",
"assets/assets/images/moods/back.png": "ed6c1bb5f20d3591dff797488c31be42",
"assets/assets/images/moodspressed/1.png": "21c83a6018521485abe39e68c585c42e",
"assets/assets/images/moodspressed/2.png": "ac37b2d148f5a0e720c93e0065009165",
"assets/assets/images/moodspressed/3.png": "c5de9cbf0b5a369f1c085d03736d85a3",
"assets/assets/images/moodspressed/4.png": "b88e06fd28c05d8259177cc5787ec135",
"assets/assets/images/moodspressed/5.png": "20eca69cfe8e33a9c2336ae06e002d5f",
"assets/assets/images/moodspressed/back-no.png": "ad24dcd72e4f111d90c2019d850ecb54",
"assets/assets/images/moodspressed/back-yes.png": "5d9ba7b21f01e636587de45bbe6549f3",
"assets/assets/images/moodspressed/back.png": "8964f7cfb5b3cd8dff131b955a6e04e5",
"assets/assets/images/mydata-active.svg": "ab8b2d7088112ca877f55efa271e66ac",
"assets/assets/images/mydata.svg": "65fd9e27e9e55f6b804f01be5f7f8000",
"assets/assets/images/person.png": "0e12645cdf47ef603a127013c06bceb9",
"assets/assets/images/plant.png": "e4d59d296d7f437c6b181f718bb13ec2",
"assets/assets/images/rewards-active.svg": "a1ce52274f759e9ee503f74a3fa0928d",
"assets/assets/images/rewards.svg": "58a7c6a668019baad76a3e3d1bc35f3e",
"assets/assets/images/ribbon.png": "8678a6c2c9e5bce8f74be9501898a5ee",
"assets/assets/images/ribbon_big.png": "3c42e21286cf22ae66c5faa9b4c46598",
"assets/assets/images/right-arrow.png": "22e54948c6931b320dbb774b8eb5a402",
"assets/assets/images/running.png": "d3abdd018f2ffcdea5c91acdf3219717",
"assets/assets/images/spotify.png": "c9b1e460013f94f77ac58a46551893a8",
"assets/assets/images/support/level1completed.png": "6ec28c15da55d0ae0dbddc1a62d0da23",
"assets/assets/images/support/level1completed.svg": "8beaf16ad7d64e06bb36cb68c4519ab4",
"assets/assets/images/support/level1Incomplete.png": "1eb9a921ae010003e8b5ab811fb9c929",
"assets/assets/images/support/level1Incomplete.svg": "81e79c34b3bd309eaf156a59340464ee",
"assets/assets/images/support/level2completed.svg": "4c85b3fdf5cd9fbe3c4e3204a5ff0d74",
"assets/assets/images/support/level2Incomplete.png": "7fa19a747d3fbc6ad36d0e3372a1d19f",
"assets/assets/images/support/level2incomplete.svg": "acf6dfb0dc7fa482021a7051c7500a57",
"assets/assets/images/support-active.svg": "2342158ed1a7174126391de50dd97d76",
"assets/assets/images/support.svg": "5daf294fb81b83676f4dbc60b30ec7d4",
"assets/assets/images/t1.png": "0b3f151ad3e89e803340db092ca4cb00",
"assets/assets/images/welldone.gif": "f5a00ebbf48020e298c74eb642b313b5",
"assets/assets/images/winner.png": "9fdce3b18b80a16d09500f7a835de925",
"assets/assets/images/winner.svg": "1c5b0cbd442f69d618419d31fd351a39",
"assets/FontManifest.json": "71a4a82de411f155107da3f8dac64ebd",
"assets/fonts/MaterialIcons-Regular.otf": "95db9098c58fd6db106f1116bae85a0b",
"assets/NOTICES": "e6f6bd257fb2f2b243e427cea5001612",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "6d342eb68f170c97609e9da345464e5e",
"assets/packages/flutter_inappwebview/assets/t_rex_runner/t-rex.css": "5a8d0222407e388155d7d1395a75d5b9",
"assets/packages/flutter_inappwebview/assets/t_rex_runner/t-rex.html": "16911fcc170c8af1c5457940bd0bf055",
"assets/packages/flutter_math_fork/lib/katex_fonts/fonts/KaTeX_AMS-Regular.ttf": "657a5353a553777e270827bd1630e467",
"assets/packages/flutter_math_fork/lib/katex_fonts/fonts/KaTeX_Caligraphic-Bold.ttf": "a9c8e437146ef63fcd6fae7cf65ca859",
"assets/packages/flutter_math_fork/lib/katex_fonts/fonts/KaTeX_Caligraphic-Regular.ttf": "7ec92adfa4fe03eb8e9bfb60813df1fa",
"assets/packages/flutter_math_fork/lib/katex_fonts/fonts/KaTeX_Fraktur-Bold.ttf": "46b41c4de7a936d099575185a94855c4",
"assets/packages/flutter_math_fork/lib/katex_fonts/fonts/KaTeX_Fraktur-Regular.ttf": "dede6f2c7dad4402fa205644391b3a94",
"assets/packages/flutter_math_fork/lib/katex_fonts/fonts/KaTeX_Main-Bold.ttf": "9eef86c1f9efa78ab93d41a0551948f7",
"assets/packages/flutter_math_fork/lib/katex_fonts/fonts/KaTeX_Main-BoldItalic.ttf": "e3c361ea8d1c215805439ce0941a1c8d",
"assets/packages/flutter_math_fork/lib/katex_fonts/fonts/KaTeX_Main-Italic.ttf": "ac3b1882325add4f148f05db8cafd401",
"assets/packages/flutter_math_fork/lib/katex_fonts/fonts/KaTeX_Main-Regular.ttf": "5a5766c715ee765aa1398997643f1589",
"assets/packages/flutter_math_fork/lib/katex_fonts/fonts/KaTeX_Math-BoldItalic.ttf": "946a26954ab7fbd7ea78df07795a6cbc",
"assets/packages/flutter_math_fork/lib/katex_fonts/fonts/KaTeX_Math-Italic.ttf": "a7732ecb5840a15be39e1eda377bc21d",
"assets/packages/flutter_math_fork/lib/katex_fonts/fonts/KaTeX_SansSerif-Bold.ttf": "ad0a28f28f736cf4c121bcb0e719b88a",
"assets/packages/flutter_math_fork/lib/katex_fonts/fonts/KaTeX_SansSerif-Italic.ttf": "d89b80e7bdd57d238eeaa80ed9a1013a",
"assets/packages/flutter_math_fork/lib/katex_fonts/fonts/KaTeX_SansSerif-Regular.ttf": "b5f967ed9e4933f1c3165a12fe3436df",
"assets/packages/flutter_math_fork/lib/katex_fonts/fonts/KaTeX_Script-Regular.ttf": "55d2dcd4778875a53ff09320a85a5296",
"assets/packages/flutter_math_fork/lib/katex_fonts/fonts/KaTeX_Size1-Regular.ttf": "1e6a3368d660edc3a2fbbe72edfeaa85",
"assets/packages/flutter_math_fork/lib/katex_fonts/fonts/KaTeX_Size2-Regular.ttf": "959972785387fe35f7d47dbfb0385bc4",
"assets/packages/flutter_math_fork/lib/katex_fonts/fonts/KaTeX_Size3-Regular.ttf": "e87212c26bb86c21eb028aba2ac53ec3",
"assets/packages/flutter_math_fork/lib/katex_fonts/fonts/KaTeX_Size4-Regular.ttf": "85554307b465da7eb785fd3ce52ad282",
"assets/packages/flutter_math_fork/lib/katex_fonts/fonts/KaTeX_Typewriter-Regular.ttf": "87f56927f1ba726ce0591955c8b3b42d",
"assets/packages/wakelock_web/assets/no_sleep.js": "7748a45cd593f33280669b29c2c8919a",
"assets/packages/youtube_player_flutter/assets/speedometer.webp": "50448630e948b5b3998ae5a5d112622b",
"assets/shaders/ink_sparkle.frag": "83a1ea5be7f661ff3ab6134efce7367c",
"canvaskit/canvaskit.js": "3725a0811e16affbef87d783520e61d4",
"canvaskit/canvaskit.wasm": "4b83d89d9fecbea8ca46f2f760c5a9ba",
"canvaskit/profiling/canvaskit.js": "491df729e7b715d86fc167feabea031a",
"canvaskit/profiling/canvaskit.wasm": "95e736ab31147d1b2c7b25f11d4c32cd",
"favicon.ico": "3b438c36a38a88e829315b1fccea40ee",
"favicon.png": "c6f21ab106a06171581247e91631bda4",
"favicon.svg": "2820b4e894a981b40f3ec410d46e6608",
"flutter.js": "57bec8d5c24a3a80888b8466d37be1d0",
"index.html": "4da9a4f25f33d0fbb590979296fd3719",
"/": "4da9a4f25f33d0fbb590979296fd3719",
"main.dart.js": "3e9a65a0b541e3c2ae0878930ce823bd",
"manifest.json": "1e1dc793bccc1ecbfc3e6b3dc7dbc8f6",
"version.json": "cf91da3d6a5f4c850d45a21a2221ff3a"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "main.dart.js",
"index.html",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache only if the resource was successfully fetched.
        return response || fetch(event.request).then((response) => {
          if (response && Boolean(response.ok)) {
            cache.put(event.request, response.clone());
          }
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
