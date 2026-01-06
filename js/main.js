const stateBox = document.getElementById("state-container");

document.querySelectorAll("button, nav a").forEach(el => {
  el.addEventListener("click", (e) => {
    e.preventDefault(); // link navigate nahi karega
    stateBox.style.display = "block"; // show container
    stateBox.innerHTML = `
      <h3>No content available</h3>
      <p>This section will be updated soon 🚧</p>
    `;
    // Optional: scroll to message
    stateBox.scrollIntoView({ behavior: 'smooth' });
  });
});