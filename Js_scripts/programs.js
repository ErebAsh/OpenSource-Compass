let programs = [];

async function init() {
    try {
        const response = await fetch('data/programs.json');
        programs = await response.json();
        render(programs);
    } catch (err) {
        console.error("Data fetch failed", err);
    }
}

function render(data) {
    const grid = document.getElementById('programsGrid');
    grid.innerHTML = data.map(p => `
        <div class="card fade-in-up active">
            <h4>${p.name}</h4>
            <span class="badge">${p.category}</span>
            <p style="margin: 15px 0;">${p.description}</p>
            <div style="font-size: 14px; color: #555;">
                <p><strong>Timeline:</strong> ${p.timeline}</p>
                <p><strong>Stipend:</strong> ${p.stipend}</p>
            </div>
            <a href="${p.link}" class="hero button" style="display:block; margin-top:20px; text-align:center; padding:10px; background:var(--secondary-blue); color:white; border-radius:6px;">View Guide</a>
        </div>
    `).join('');
}

function applyFilters() {
    const search = document.getElementById('searchBar').value.toLowerCase();
    const cat = document.getElementById('categoryFilter').value;

    const filtered = programs.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(search);
        const matchesCat = cat === 'all' || p.category === cat;
        return matchesSearch && matchesCat;
    });
    render(filtered);
}

document.getElementById('searchBar').addEventListener('input', applyFilters);
document.getElementById('categoryFilter').addEventListener('change', applyFilters);
document.addEventListener('DOMContentLoaded', init);