const puppeteer = require("puppeteer");

async function getFilm() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto("https://www.galaxycine.vn/en/phim-dang-chieu");

  const films = await page.evaluate(() => {
    let items = document.querySelectorAll(".watchmovie-item");

    let links = [];

    items.forEach((item) => {
      links.push({
        title: item.querySelector(".title-watchmovie").textContent,
        img: item.querySelector(".article-watchmovie img").src,
        url:
          "https://www.galaxycine.vn" +
          item.querySelector(".article-watchmovie a").getAttribute("href"),
      });
    });

    return links;
  });
  // console.log(films);

  await browser.close();
  return films;
}

async function getFilmDetail(url) {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto(url);

  const films = await page.evaluate(() => {
    let item = document.querySelector(".details");
    let links = [];

    links.push({
      name: item.querySelector(".detail-title").textContent,
      img: document.querySelector(".detail-feat-img img").src,
      rating: item.querySelector(
        ".detail-rating .rating-wrap .rating-movie .rating-value strong"
      ).textContent,
      content: document.querySelector(
        "#info .content-text-actors-info auto-folded p span span"
      ).textContent,
      trailer: document
        .querySelector("galaxy-watch-trailer")
        .getAttribute("ng-trailer")
        .slice(1, -1),
    });

    let detailInfo = item.querySelectorAll(".detail-info-row");
    detailInfo.forEach((i) => {
      let attr = i
        .querySelector("label")
        .textContent.slice(0, -2)
        .toLowerCase();
      if (attr == undefined) return;

      links[0][attr] =
        i.querySelector(".detail-info-right").getAttribute("href") != null
          ? i.querySelector(".detail-info-right a").getAttribute("href")
          : i.querySelector(".detail-info-right").textContent;
    });
    return links;
  });
  console.log(films);

  await browser.close();
  return films[0];
}

let filmList = getFilm().then((films) => {
  let index = 0;
  let length = films.length;
  let result = [];
  async function doNext() {
    if (index < length) {
      result.push(await getFilmDetail(films[index].url));
      console.log(result);
    } else clearTimeout(doNext);
    index++;
    setTimeout(doNext, 12000);
  }

  doNext();
});
