const puppeteer = require('puppeteer');
const { createObjectCsvWriter } = require('csv-writer');

(async () => {
  const browser = await puppeteer.launch({ headless: false });

  const totalPages = 1; // Set the total number of pages you want to scrape
  const results = [];

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    const pageUrl = `https://suumo.jp/jj/bukken/ichiran/JJ012FC001/?ar=030&bs=011&cn=9999999&cnb=0&et=9999999&initFlg=1&kb=1&kki=101&kt=9999999&mb=0&mt=9999999&ta=12&tj=0&pc=30&po=1&pj=2&page=${pageNum}`;

    const page = await browser.newPage();
    await page.goto(pageUrl, { waitUntil: 'domcontentloaded' });
    console.log(`Scraping page ${pageNum}: ${pageUrl}`);

    // Get all the property links on this page
    const propertyLinks = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('h2.property_unit-title a'));
      return links.map(link => link.href);
    });

    console.log(`Found ${propertyLinks.length} properties on page ${pageNum}.`);

    // for (let i = 0; i < propertyLinks.length; i++) {
    for (let i = 0; i < 5; i++) {
      const url = propertyLinks[i];
      const detailPage = await browser.newPage();
      await detailPage.goto(url, { waitUntil: 'domcontentloaded' });

      // Extract images
      const imageUrls = await detailPage.evaluate(() => {
        const imgs = Array.from(document.querySelectorAll('.js-slideLazy-image.js-noContextMenu'));
        const srcs = imgs.map(img => img.src || img.getAttribute('rel'));
        return srcs.slice(0, 5);
      });

      //get the text from the 11th <td> in the table
      const tdText1 = await detailPage.evaluate(() => {
        const td = document.querySelector('table.bdclps.mt10 tbody tr:nth-child(11) td');
        return td ? td.textContent.trim() : '';
      });

      const tdText2 = await detailPage.evaluate(() => {
        const td = document.querySelector('table.bdclps.mt10 tbody tr:nth-child(12) td');
        return td ? td.textContent.trim() : '';
      });

      // Extract and clean tel number to keep only digits and common symbols
      const telnumber = await detailPage.evaluate(() => {
        const telElement = document.querySelector('.tar.fgDRed.fs22.b');
        if (telElement) {
          const text = telElement.textContent.trim();
          return text.replace(/^TEL：?/, '').trim().replace(/[^0-9\- \(\)]/g, '').trim();
        }
        return '';
      });

      // Extract multiple info from <td class="w299 bdCell">
      const infoMap = await detailPage.evaluate(() => {
        const tds = Array.from(document.querySelectorAll('td.w299.bdCell'));
        const labels = [
          '販売スケジュール', 'イベント情報', '販売戸数', '最多価格帯', '価格', '管理費', '修繕積立金',
          '修繕積立基金', '諸費用', '間取り', '専有面積', 'その他面積', '引渡可能時期',
          '完成時期(築年月)', '所在階', '向き', 'エネルギー消費性能', '断熱性能', '目安光熱費',
          'リフォーム', '所在地', '交通', '総戸数', '構造・階建て', '敷地面積', '敷地の権利形態',
          '用途地域', '駐車場'
        ];

        const info = {}; // Initialize info object

        tds.forEach((td, index) => {
          let text = td.innerText; // full text
          // Optionally replace line breaks and tabs
          text = text.replace(/\r?\n/g, ' ').replace(/\t/g, ' ').trim();
          const label = labels[index] || `info_${index}`;
          info[label] = text;
        });
        return info;
      });

      // console.log(`Item No: ${i + 1} on page ${pageNum}`);
      // console.log(`URL: ${url}`);
      // console.log('Telephone:', telnumber);
      // console.log('Images:', imageUrls);
      // console.log('Additional Info:', infoMap);
      console.log('TD Text:', tdText1);
      console.log('TD Text:', tdText2);

      results.push({
        itemNo: (pageNum - 1) * propertyLinks.length + i + 1,
        url,
        telnumber,
        images: imageUrls,
        ...infoMap, // Spread the info as individual properties if desired
      });

      await detailPage.close();
    }

    await page.close(); // Close the listing page after processing
  }

  // Prepare CSV headers, including all info keys
  const headers = [
    { id: 'itemNo', title: 'ItemNo' },
    { id: 'url', title: 'URL' },
    { id: 'telnumber', title: 'TelephoneNumber' },
    { id: 'image1', title: 'Image1' },
    { id: 'image2', title: 'Image2' },
    { id: 'image3', title: 'Image3' },
    { id: 'image4', title: 'Image4' },
    { id: 'image5', title: 'Image5' },
    // Add headers for all info labels dynamically
  ];

  // Collect all keys from infoMap to generate headers
  const allInfoKeys = Array.from(new Set(results.flatMap(item => Object.keys(item).filter(k => !['itemNo', 'url', 'telnumber', 'images'].includes(k)))));
  allInfoKeys.forEach(key => {
    headers.push({ id: key, title: key });
  });

  const csvWriter = createObjectCsvWriter({
    path: 'properties.csv',
    header: headers
  });

  // Map results to include info fields explicitly
  const records = results.map(item => {
    const record = {
      itemNo: item.itemNo,
      url: item.url,
      telnumber: item.telnumber,
      image1: item.images[0] || '',
      image2: item.images[1] || '',
      image3: item.images[2] || '',
      image4: item.images[3] || '',
      image5: item.images[4] || ''
    };
    // Add dynamic info fields
    allInfoKeys.forEach(key => {
      record[key] = item[key] || '';
    });
    return record;
  });

  await csvWriter.writeRecords(records);
  console.log('All data with additional info saved to CSV.');

  await browser.close();
})();