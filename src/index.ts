const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// スクレイピング対象のURL
const urls = ['https://qiita.com/', 'https://developer.mozilla.org/en-US/'];

// スクレイピング
const crawl = async (url: string) => {

    // ファイル名用の現在日付作成
    const now = (() => {
        const d = new Date();
        return `${d.getFullYear()}_${(d.getMonth()+1)}_${d.getDate()}_${d.getHours()}-${d.getMinutes()}-${d.getSeconds()}`;
    })();

    // ブラウザー開く
    const browser = await puppeteer.launch({
        headless: false,
        slowMo: 50,
        defaultViewport: {
            width: 1280,
            height: 800
        }
    });

    // 新規タブ
    const page = await browser.newPage();

    //  URLへアクセス
    await page.goto(url);

    // ScreenShot保存
    const imgPath = path.join('./ss', `${now}.png`);
    await page.screenshot({
        path: imgPath,
        fullPage: true,
    });

    // ドキュメントの情報を取得
    const metaData = await page.evaluate(() => {

        return {
            'title': document.querySelector('title')?.textContent,
            'description': (<HTMLMetaElement>document.querySelector('meta[name="description"]'))?.content,
            'h1': document.querySelector('h1')?.textContent,
        };
    });

    // セッション終了
    await browser.close();

    return {
        img: imgPath,
        ...metaData
    }
};

// 対象URL分スクレイピング処理を実行する
const handleCrawler = async () => {
    const r = [];
    for (let v of urls) {
        r.push(await crawl(v));
    }
    console.log(r);
};

(async () => {
    // スクリーンショット保存用のディレクトリがない場合
    if (!fs.existsSync('ss')) {
        // ScreenShot保存ディレクトリ作成後、実行
        fs.mkdir('ss', () => {
            handleCrawler();
        });
    }
    // 保存用ディレクトリが既存の場合、そのまま実行
    else {
        handleCrawler();
    }
})();