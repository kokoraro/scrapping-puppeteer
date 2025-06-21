const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');
const axios = require('axios');

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const randomtime = (min = 1000, max = 2000) => Math.floor(Math.random() * (max - min + 1)) + min;

(async () => {
  // Create a timestamped parent folder
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const parentDir = path.join(__dirname, "homes" + timestamp);
  if (!fs.existsSync(parentDir)) {
    fs.mkdirSync(parentDir);
  }

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', // Use real Chrome
    headless: false, // Open a visible browser window
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-extensions',
      '--disable-infobars',
      '--window-size=1920,1080',
      '--disable-gpu',
      '--disable-web-security',
      '--allow-running-insecure-content',
      '--ignore-certificate-errors',
      '--disable-features=IsolateOrigins,site-per-process',
      '--disable-blink-features=AutomationControlled',
      '--enable-features=NetworkService,NetworkServiceInProcess',
      '--disable-background-networking',
      '--disable-background-timer-throttling',
      '--disable-renderer-backgrounding',
      '--disable-backgrounding-occluded-windows',
      '--disable-client-side-phishing-detection',
      '--disable-component-update',
      '--window-size=1280,800'
    ]
  });
  const totalPages = 2; // Set the number of pages to scrape

  const allRecords = []; // To store all property data

  const pageUrl = `https://www.homes.co.jp/mansion/chuko/chiba/list/`;

  const page = await browser.newPage();
  await page.goto(pageUrl, { waitUntil: 'domcontentloaded' });
  await page.setViewport({ width: 1280, height: 800 });

  await delay(randomtime());
  await page.select('#cond_sortby', 'newdate'); // Sort by "新着順"
  await delay(randomtime());
  await page.select('#cond_newdate', '1'); // select "本日"

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    console.log(`Scraping page ${pageNum}: ${pageUrl}`);

    // Get property links
    const propertyLinks = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('.mod-bukkenList .prg-bundle .mod-mergeBuilding--sale .moduleInner .moduleHead h3 a'));
      return links.map(link => link.href);
    });

    for (let i = 0; i < propertyLinks.length; i++) {
      console.log(`Property ${i + 1} URL: ${propertyLinks[i]}`);
    }

    console.log(`Found ${propertyLinks.length} properties on page ${pageNum}.`);

    for (let i = 0; i < propertyLinks.length; i++) {
      await delay(randomtime()); // Wait for random seconds to ensure the page is fully loaded

      const url = propertyLinks[i];
      const detailPage = await browser.newPage();
      await detailPage.goto(url, { waitUntil: 'domcontentloaded' });

      // Create folder for images
      const propertyFolderName = `property_${i + 1 + (pageNum - 1) * propertyLinks.length}`;
      const propertyFolderPath = path.join(parentDir, propertyFolderName);
      if (!fs.existsSync(propertyFolderPath)) {
        fs.mkdirSync(propertyFolderPath);
      }

      // Extract image URLs
      const imageUrls = await detailPage.evaluate(() => {
        const imgs = Array.from(document.querySelectorAll('.max-w-screen.object-contain'));
        console.log('Image count:', imgs.length);
        return imgs.slice(0, 5).map(img => img.src || img.getAttribute('rel'));
      });

      console.log('count: %d', imageUrls.length);

      // Download images into folder
      await delay(randomtime); // Wait for 2 seconds before downloading images

      for (let j = 0; j < imageUrls.length; j++) {
        const imageUrl = imageUrls[j];
        console.log("imageUrl: ", imageUrl);
        const imagePath = path.join(propertyFolderPath, `image_${j + 1}.jpg`);
        try {
          const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
          fs.writeFileSync(imagePath, response.data);
        } catch (err) {
          console.error(`Failed to download image ${imageUrl}: ${err.message}`);
        }
      }

      const detailinfo = await detailPage.evaluate(() => {
        const info = [];
        let element = '';
        element = document.querySelector('tbody.divide-y.divide-mono-300 tr:nth-child(1) td p');
        info[0] = element ? element.textContent.trim() : '';
        element = document.querySelector('tbody.divide-y.divide-mono-300 tr:nth-child(2) td');
        info[1] = element ? element.textContent.trim() : '';
        element = document.querySelector('tbody.divide-y.divide-mono-300 tr:nth-child(3) td');
        info[2] = element ? element.textContent.trim() : '';
        element = document.querySelector('tbody.divide-y.divide-mono-300 tr:nth-child(4) td');
        info[3] = element ? element.textContent.trim() : '';
        element = document.querySelector('tbody.divide-y.divide-mono-300 tr:nth-child(5) td');
        info[4] = element ? element.textContent.trim() : '';
        element = document.querySelector('tbody.divide-y.divide-mono-300 tr:nth-child(6) td');
        info[5] = element ? element.textContent.trim() : '';
        element = document.querySelector('tbody.divide-y.divide-mono-300 tr:nth-child(7) td');
        info[6] = element ? element.textContent.trim() : '';
        element = document.querySelector('tbody.divide-y.divide-mono-300 tr:nth-child(8) td');
        info[7] = element ? element.textContent.trim() : '';
        element = document.querySelector('tbody.divide-y.divide-mono-300 tr:nth-child(9) td');
        info[8] = element ? element.textContent.trim() : '';
        element = document.querySelector('tbody.divide-y.divide-mono-300 tr:nth-child(10) td');
        info[9] = element ? element.textContent.trim() : '';
        element = document.querySelector('tbody.divide-y.divide-mono-300 tr:nth-child(11) td');
        info[10] = element ? element.textContent.trim() : '';
        element = document.querySelector('tbody.divide-y.divide-mono-300 tr:nth-child(12) td');
        info[11] = element ? element.textContent.trim() : '';
        element = document.querySelector('tbody.divide-y.divide-mono-300 tr:nth-child(13) td');
        info[12] = element ? element.textContent.trim() : '';
        element = document.querySelector('tbody.divide-y.divide-mono-300 tr:nth-child(14) td');
        info[13] = element ? element.textContent.trim() : '';
        element = document.querySelector('tbody.divide-y.divide-mono-300 tr:nth-child(15) td');
        info[14] = element ? element.textContent.trim() : '';
        element = document.querySelector('tbody.divide-y.divide-mono-300 tr:nth-child(16) td');
        info[15] = element ? element.textContent.trim() : '';
        element = document.querySelector('tbody.divide-y.divide-mono-300 tr:nth-child(17) td');
        info[16] = element ? element.textContent.trim() : '';
        element = document.querySelector('tbody.divide-y.divide-mono-300 tr:nth-child(18) td');
        info[17] = element ? element.textContent.trim() : '';
        element = document.querySelector('tbody.divide-y.divide-mono-300 tr:nth-child(19) td div p');
        info[18] = element ? element.textContent.trim() : '';
        element = document.querySelector('tbody.divide-y.divide-mono-300 tr:nth-child(20) td');
        info[19] = element ? element.textContent.trim() : '';
        element = document.querySelector('tbody.divide-y.divide-mono-300 tr:nth-child(21) td');
        info[20] = element ? element.textContent.trim() : '';
        element = document.querySelector('tbody.divide-y.divide-mono-300 tr:nth-child(22) td');
        info[21] = element ? element.textContent.trim() : '';
        element = document.querySelector('tbody.divide-y.divide-mono-300 tr:nth-child(23) td');
        info[22] = element ? element.textContent.trim() : '';
        element = document.querySelector('tbody.divide-y.divide-mono-300 tr:nth-child(24) td');
        info[23] = element ? element.textContent.trim() : '';
        element = document.querySelector('tbody.divide-y.divide-mono-300 tr:nth-child(25) td');
        info[24] = element ? element.textContent.trim() : '';
        element = document.querySelector('#about div.mt-6 div.space-y-1 p:nth-child(1)');
        info[25] = element ? element.textContent.trim().split('：')[1] : '';
        element = document.querySelector('#about div.mt-6 div.space-y-1 p:nth-child(2)');
        info[26] = element ? element.textContent.trim().split('：')[1] : '';
        element = document.querySelector('#about div.mt-6 div.space-y-1 p:nth-child(3)');
        info[27] = element ? element.textContent.trim().split('：')[1] : '';
        element = document.querySelector('#about div.mt-6 div.space-y-1 p:nth-child(4)');


        element = document.querySelector('.sticky.w-80.rounded-lg div div div p');
        info[28] = element ? element.textContent.trim().replace(/[^0-9\- \(\)]/g, '').trim() : '';

        element = document.querySelector('.sticky.w-80.rounded-lg .mt-4.space-y-1 p:nth-child(2)');
        info[29] = element ? element.textContent.trim().split('：')[1] : '';


        return info;
      });

      // Prepare data record
      const record = {
        url,
        'ImageURLs1': imageUrls[0],
        'ImageURLs2': imageUrls[1],
        'ImageURLs3': imageUrls[2],
        'ImageURLs4': imageUrls[3],
        'ImageURLs5': imageUrls[4],
        'info1': detailinfo[0],
        'info2': detailinfo[1],
        'info3': detailinfo[2],
        'info4': detailinfo[3],
        'info5': detailinfo[4],
        'info6': detailinfo[5],
        'info7': detailinfo[6],
        'info8': detailinfo[7],
        'info9': detailinfo[8],
        'info10': detailinfo[9],
        'info11': detailinfo[10],
        'info12': detailinfo[11],
        'info13': detailinfo[12],
        'info14': detailinfo[13],
        'info15': detailinfo[14],
        'info16': detailinfo[15],
        'info17': detailinfo[16],
        'info18': detailinfo[17],
        'info19': detailinfo[18],
        'info20': detailinfo[19],
        'info21': detailinfo[20],
        'info22': detailinfo[21],
        'info23': detailinfo[22],
        'info24': detailinfo[23],
        'info25': detailinfo[24],
        'info26': detailinfo[25],
        'info27': detailinfo[26],
        'info28': detailinfo[27],
        'info29': detailinfo[28] || '', // 株式会社
        'info30': detailinfo[29] || '' // Tel
      };

      // Add record to all records array
      allRecords.push(record);
      await detailPage.close();
    }
    // Click the "nextPage" button to navigate to the next page
    const nextPageButtonSelector = '.nextPage';
    const nextPageExists = await page.$(nextPageButtonSelector);
  
    if (nextPageExists) {
      console.log('Navigating to the next page...');
      await page.click(nextPageButtonSelector);
      await page.waitForNavigation({ waitUntil: 'domcontentloaded' });
    } else {
      console.log('No next page button found. Ending pagination.');
    }
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Data');

  // Define columns with desired widths
  worksheet.columns = [
    { header: 'URL', key: 'url', width: '20' },
    { header: '画像1', key: 'ImageURLs1', width: '20' },
    { header: '画像2', key: 'ImageURLs2', width: '20' },
    { header: '画像3', key: 'ImageURLs3', width: '20' },
    { header: '画像4', key: 'ImageURLs4', width: '20' },
    { header: '画像5', key: 'ImageURLs5', width: '20' },
    { header: '株式会社', key: 'info29', width: '30' },
    { header: 'Tel', key: 'info30', width: '30' },
    { header: '価格', key: 'info1', width: '30' },
    { header: '管理費等', key: 'info2', width: '30' },
    { header: '修繕積立金', key: 'info3', width: '30' },
    { header: '間取り', key: 'info4', width: '30' },
    { header: '専有面積', key: 'info5', width: '20' },
    { header: 'バルコニー面積', key: 'info6', width: '20' },
    { header: '駐車場', key: 'info7', width: '20' },
    { header: '築年月', key: 'info8', width: '20' },
    { header: '所在地', key: 'info9', width: '30' },
    { header: '交通', key: 'info10', width: '20' },
    { header: '所在階 / 階数', key: 'info11', width: '20' },
    { header: '総戸数', key: 'info12', width: '20' },
    { header: '主要採光面', key: 'info13', width: '20' },
    { header: '建物構造', key: 'info14', width: '20' },
    { header: '用途地域', key: 'info15', width: '20' },
    { header: '土地権利', key: 'info16', width: '20' },
    { header: '国土法届出', key: 'info17', width: '30' },
    { header: '管理', key: 'info18', width: '30' },
    { header: '現況', key: 'info19', width: '30' },
    { header: '引渡し', key: 'info20', width: '30' },
    { header: '取引態様', key: 'info21', width: '30' },
    { header: 'その他条件', key: 'info22', width: '30' },
    { header: '備考', key: 'info23', width: '50' },
    { header: 'LIFULL HOME\'S 物件番号', key: 'info24', width: '30' },
    { header: '自社物件番号', key: 'info25', width: '30' },

    { header: '情報公開日', key: 'info26', width: '30' },
    { header: '最新情報提供日', key: 'info27', width: '30' },
    { header: '情報有効期限', key: 'info28', width: '30' },
  ];

  // Add data rows
  allRecords.forEach(record => {
    worksheet.addRow(record);
  });

  // Save the Excel file
  const excelPath = path.join(parentDir, 'scrapping.xlsx');
  await workbook.xlsx.writeFile(excelPath);
  console.log('Scraping complete! Data saved.');

  await browser.close();
})();