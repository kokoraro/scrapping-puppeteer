const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');
const axios = require('axios');

(async () => {
  // Create a timestamped parent folder
  //
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const parentDir = path.join(__dirname, "suumo" + timestamp);
  if (!fs.existsSync(parentDir)) {
    fs.mkdirSync(parentDir);
  }

  const imageDir = path.join(parentDir, "Images");
  if (!fs.existsSync(imageDir)) {
    fs.mkdirSync(imageDir);
  }

  const browser = await puppeteer.launch({ headless: false });
  const totalPages = 2; // Set the number of pages to scrape

  const allRecords = []; // To store all property data

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    const pageUrl = `https://suumo.jp/jj/bukken/ichiran/JJ012FC001/?ar=030&bs=011&cn=9999999&cnb=0&et=9999999&initFlg=1&kb=1&kki=101&kt=9999999&mb=0&mt=9999999&ta=12&tj=0&pc=30&po=1&pj=2&page=${pageNum}`;
    const page = await browser.newPage();
    await page.goto(pageUrl, { waitUntil: 'domcontentloaded' });
    console.log(`Scraping page ${pageNum}: ${pageUrl}`);

    // Get property links
    const propertyLinks = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('h2.property_unit-title a'));
      return links.map(link => link.href);
    });

    console.log(`Found ${propertyLinks.length} properties on page ${pageNum}.`);

    for (let i = 0; i < Math.min(30, propertyLinks.length); i++) {
      const url = propertyLinks[i];
      const detailPage = await browser.newPage();
      await detailPage.goto(url, { waitUntil: 'domcontentloaded' });

      // Create folder for images
      const propertyFolderName = `property_${i + 1 + (pageNum - 1) * propertyLinks.length}`;
      const propertyFolderPath = path.join(imageDir, propertyFolderName);
      if (!fs.existsSync(propertyFolderPath)) {
        fs.mkdirSync(propertyFolderPath);
      }

      // Extract image URLs
      const imageUrls = await detailPage.evaluate(() => {
        const imgs = Array.from(document.querySelectorAll('.js-slideLazy-image.js-noContextMenu'));
        const srcs = imgs.map(img => img.src || img.getAttribute('rel'));
        return srcs.slice(0, 5);
      });

      // Download images into folder
      for (let j = 0; j < imageUrls.length; j++) {
        const imageUrl = imageUrls[j];
        console.log(`Downloading image ${j + 1} from ${imageUrl}`);
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
        element = document.querySelector('table.bdclps.mt10 tbody tr:nth-child(1) td:nth-child(2)');
        info[0] = element ? element.textContent.trim() : '';
        element = document.querySelector('table.bdclps.mt10 tbody tr:nth-child(1) td:nth-child(4)');
        info[1] = element ? element.textContent.trim() : '';
        element = document.querySelector('table.bdclps.mt10 tbody tr:nth-child(2) td:nth-child(2)');
        info[2] = element ? element.textContent.trim() : '';
        element = document.querySelector('table.bdclps.mt10 tbody tr:nth-child(2) td:nth-child(4)');
        info[3] = element ? element.textContent.trim() : '';
        element = document.querySelector('table.bdclps.mt10 tbody tr:nth-child(3) td:nth-child(2)');
        info[4] = element ? element.textContent.trim() : '';
        element = document.querySelector('table.bdclps.mt10 tbody tr:nth-child(3) td:nth-child(4)');
        info[5] = element ? element.textContent.trim() : '';
        element = document.querySelector('table.bdclps.mt10 tbody tr:nth-child(4) td:nth-child(2)');
        info[6] = element ? element.textContent.trim() : '';
        element = document.querySelector('table.bdclps.mt10 tbody tr:nth-child(4) td:nth-child(4)');
        info[7] = element ? element.textContent.trim() : '';
        element = document.querySelector('table.bdclps.mt10 tbody tr:nth-child(5) td:nth-child(2)');
        info[8] = element ? element.textContent.trim() : '';
        element = document.querySelector('table.bdclps.mt10 tbody tr:nth-child(5) td:nth-child(4)');
        info[9] = element ? element.textContent.trim() : '';
        element = document.querySelector('table.bdclps.mt10 tbody tr:nth-child(6) td:nth-child(2)');
        info[10] = element ? element.textContent.trim() : '';
        element = document.querySelector('table.bdclps.mt10 tbody tr:nth-child(6) td:nth-child(4)');
        info[11] = element ? element.textContent.trim() : '';
        element = document.querySelector('table.bdclps.mt10 tbody tr:nth-child(7) td:nth-child(2)');
        info[12] = element ? element.textContent.trim() : '';
        element = document.querySelector('table.bdclps.mt10 tbody tr:nth-child(7) td:nth-child(4)');
        info[13] = element ? element.textContent.trim() : '';
        element = document.querySelector('table.bdclps.mt10 tbody tr:nth-child(8) td:nth-child(2)');
        info[14] = element ? element.textContent.trim() : '';
        element = document.querySelector('table.bdclps.mt10 tbody tr:nth-child(8) td:nth-child(4)');
        info[15] = element ? element.textContent.trim() : '';
        element = document.querySelector('table.bdclps.mt10 tbody tr:nth-child(9) td:nth-child(2)');
        info[16] = element ? element.textContent.trim() : '';
        element = document.querySelector('table.bdclps.mt10 tbody tr:nth-child(9) td:nth-child(4)');
        info[17] = element ? element.textContent.trim() : '';
        element = document.querySelector('table.bdclps.mt10 tbody tr:nth-child(10) td:nth-child(2)');
        info[18] = element ? element.textContent.trim() : '';
        element = document.querySelector('table.bdclps.mt10 tbody tr:nth-child(10) td:nth-child(4)');
        info[19] = element ? element.textContent.trim() : '';
        element = document.querySelector('table.bdclps.mt10 tbody tr:nth-child(11) td');
        info[20] = element ? element.textContent.trim() : '';
        element = document.querySelector('table.bdclps.mt10 tbody tr:nth-child(12) td');
        info[21] = element ? element.textContent.trim() : '';
        element = document.querySelectorAll('table.bdclps.mt10')[1]?.querySelector('tbody tr:nth-child(1) td:nth-child(2)');
        info[22] = element ? element.textContent.trim() : '';
        element = document.querySelectorAll('table.bdclps.mt10')[1]?.querySelector('tbody tr:nth-child(1) td:nth-child(4)');
        info[23] = element ? element.textContent.trim() : '';
        element = document.querySelectorAll('table.bdclps.mt10')[1]?.querySelector('tbody tr:nth-child(2) td:nth-child(2)');
        info[24] = element ? element.textContent.trim() : '';
        element = document.querySelectorAll('table.bdclps.mt10')[1]?.querySelector('tbody tr:nth-child(2) td:nth-child(4)');
        info[25] = element ? element.textContent.trim() : '';
        element = document.querySelectorAll('table.bdclps.mt10')[1]?.querySelector('tbody tr:nth-child(3) td:nth-child(2)');
        info[26] = element ? element.textContent.trim() : '';
        element = document.querySelectorAll('table.bdclps.mt10')[1]?.querySelector('tbody tr:nth-child(3) td:nth-child(4)');
        info[27] = element ? element.textContent.trim() : '';
        element = document.querySelectorAll('table.bdclps.mt10')[1]?.querySelector('tbody tr:nth-child(4) td:nth-child(2)');
        info[28] = element ? element.textContent.trim() : '';
        element = document.querySelectorAll('table.bdclps.mt10')[1]?.querySelector('tbody tr:nth-child(4) td:nth-child(4)');
        info[29] = element ? element.textContent.trim() : '';
        element = document.querySelector('table.mt10.bdGrayT.bdGrayL.bgWhite.pCell10.bdclps.wf.zm1 tbody tr:nth-child(2) td div');
        info[30] = element ? element.textContent.trim() : '';
        element = document.querySelector('table.mt10.bdGrayT.bdGrayL.bgWhite.pCell10.bdclps.wf.zm1 tbody tr:nth-child(2) td div.fgDRed');
        info[31] = element ? element.textContent.trim().replace(/[^0-9\- \(\)]/g, '').trim() : '';

        for (let i = 0; i < info.length; i++) {
          info[i] = info[i].replace(/\t/g, '').replace(/\n+/g, '\n').trim();
        }
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
        'info29': detailinfo[28],
        'info30': detailinfo[29],
        'info31': detailinfo[30],
        'info32': detailinfo[31],
      };

      // Add record to all records array
      allRecords.push(record);

      await detailPage.close();
    }

    await page.close();
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Data');

  // Define columns with desired widths
  worksheet.columns = [
    { header: '不動産のURL', key: 'url', width: '20' },
    { header: '画像1', key: 'ImageURLs1', width: '20' },
    { header: '画像2', key: 'ImageURLs2', width: '20' },
    { header: '画像3', key: 'ImageURLs3', width: '20' },
    { header: '画像4', key: 'ImageURLs4', width: '20' },
    { header: '画像5', key: 'ImageURLs5', width: '20' },
    { header: '株式会社', key: 'info31', width: '30' },
    { header: 'Tel', key: 'info32', width: '30' },
    { header: '販売スケジュール', key: 'info1', width: '30' },
    { header: 'イベント情報', key: 'info2', width: '30' },
    { header: '販売戸数', key: 'info3', width: '30' },
    { header: '最多価格帯', key: 'info4', width: '30' },
    { header: '価格', key: 'info5', width: '20' },
    { header: '管理費', key: 'info6', width: '20' },
    { header: '修繕積立金', key: 'info7', width: '20' },
    { header: '修繕積立基金', key: 'info8', width: '20' },
    { header: '諸費用', key: 'info9', width: '20' },
    { header: '間取り', key: 'info10', width: '20' },
    { header: '専有面積', key: 'info11', width: '20' },
    { header: 'その他面積', key: 'info12', width: '30' },
    { header: '引渡可能時期', key: 'info13', width: '20' },
    { header: '完成時期(築年月)', key: 'info14', width: '20' },
    { header: '所在階', key: 'info15', width: '20' },
    { header: '向き', key: 'info16', width: '30' },
    { header: 'エネルギー消費性能', key: 'info17', width: '30' },
    { header: '断熱性能', key: 'info18', width: '30' },
    { header: '目安光熱費', key: 'info19', width: '30' },
    { header: 'リフォーム', key: 'info20', width: '30' },
    { header: 'その他制限事項', key: 'info21', width: '30' },
    { header: 'その他概要・特記事項', key: 'info22', width: '30' },
    { header: '所在地', key: 'info23', width: '30' },
    { header: '交通', key: 'info24', width: '100' },
    { header: '総戸数', key: 'info25', width: '30' },
    { header: '構造・階建て', key: 'info26', width: '30' },
    { header: '敷地面積', key: 'info27', width: '30' },
    { header: '敷地の権利形態', key: 'info28', width: '30' },
    { header: '用途地域', key: 'info29', width: '30' },
    { header: '駐車場', key: 'info30', width: '20' },
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