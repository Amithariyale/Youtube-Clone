const API_KEY = "";
const BASE_URL = "https://www.googleapis.com/youtube/v3";

window.addEventListener("load", () => {
  const search = new URLSearchParams(window.location.search);
  const channelId = search.get("channelId");
  console.log(channelId);

  if (channelId) {
    loadChannelInfo(channelId);
  }
});

async function loadChannelInfo(channelId) {
  try {
    const response = await fetch(
      `${BASE_URL}/channels?key=${API_KEY}&part=snippet&id=${channelId}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    if (data.items) {
      displayChannelInfo(data.items[0]);
    }
  } catch (error) {
    console.error("Error fetching channel info: ", error);
  }
}

function displayChannelInfo(channelData) {
  console.log(channelData);
}
const toggleSidebarBtn = document.getElementById("toggle_btn");
const sidebarMenu = document.getElementById("sidebar_menu");
const sidebarToggleMenu = document.getElementById("sidebar_toggle_menu");

toggleSidebarBtn.addEventListener("click", () => {
  sidebarMenu.style.display =
    sidebarMenu.style.display === "none" ? "flex" : "none";
  sidebarToggleMenu.style.display =
    sidebarToggleMenu.style.display === "none" ? "flex" : "none";
});
