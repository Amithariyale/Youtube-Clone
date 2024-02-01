const BASE_URL = "https://www.googleapis.com/youtube/v3";
const API_KEY = "";
const videoContainer = document.getElementById("video_container");
const searchFrom = document.getElementById("search_form");

document.addEventListener("DOMContentLoaded", () => {
  fetchVideos();
});
async function fetchVideos(searchQuery = "science") {
  try {
    const jsonData = await fetch(
      `${BASE_URL}/search?key=${API_KEY}&q=${searchQuery}&part=snippet&type=video&maxResults=10`
    );
    const data = await jsonData.json();
    console.log(data.items[0]);
    showVideos(data.items);
  } catch (error) {
    console.log(error);
  }
}

async function getVideoStats(videoId) {
  try {
    const response = await fetch(
      `${BASE_URL}/videos?key=${API_KEY}&part=statistics&id=${videoId}`
    );
    const data = await response.json();
    return data.items[0].statistics.viewCount;
  } catch (error) {
    console.log(error);
  }
}

async function getChannelLogo(channelId) {
  try {
    const jsonData = await fetch(
      `${BASE_URL}/channels?key=${API_KEY}&id=${channelId}&part=snippet&maxResult=20`
    );
    const data = await jsonData.json();
    return data.items[0].snippet.thumbnails.default.url;
  } catch (error) {
    console.log(error);
  }
}

function formatNumber(num) {
  // Convert the number to a string
  num = num.toString();

  // Check if the number is greater than 999
  if (num.length > 3) {
    // Check if the number is in the millions
    if (num.length > 6 && num.length <= 9) {
      // Convert to millions
      num = (parseFloat(num) / 1000000).toFixed(1) + "M";
    } else if (num.length > 9) {
      // Check if the number is in the billions
      // Convert to billions
      num = (parseFloat(num) / 1000000000).toFixed(1) + "B";
    } else {
      // Convert to thousands
      num = (parseFloat(num) / 1000).toFixed(1) + "K";
    }
  }

  return num;
}
function showVideos(videos) {
  videoContainer.innerHTML += "";

  videos.map((video) => {
    let channelLogo;
    getChannelLogo(video.snippet.channelId)
      .then((logo) => {
        channelLogo = logo;
        return getVideoStats(video.id.videoId);
      })
      .then((views) => {
        videoContainer.innerHTML += `
        <div class="videoCard">
            <a  href="vide.html/video?id=${video.id.videoId}">
                <div class="img_container">
                    <img class="thumbnail" src="${
                      video.snippet.thumbnails.high.url
                    }">
                </div>
                <div class="video_details">
                    <img class="logo" src="${channelLogo}">
                    <div>
                        <p>${video.snippet.title}</p>
                        <p class="channel">${video.snippet.channelTitle}</p>
                        <p class="views">${formatNumber(views)} views </p>
                    </div>
                </div>
            </a>
        </div>
          `;
      });
  });
}

searchFrom.addEventListener("submit", (e) => {
  e.preventDefault();
  let searchQuery = document.getElementById("search_input").value;
  searchQuery.trim();
  fetchVideos(searchQuery.split(" ").join("+"));
});
