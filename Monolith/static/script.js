const productsPerPage = 3; // Produkte pro Seite
const totalProducts = 20; // Maximale Anzahl der Produkte pro Kategorie

// Speichere die aktuelle Seite für jede Kategorie
let currentPage = {
    new: 0,
    bestsellers: 0,
    recommended: 0
};

// Starte das Laden der Produkte, wenn die HTML Seite vollständig geladen ist
document.addEventListener('DOMContentLoaded', () => {
    loadCategoryProducts('new-products-list', 'new-pagination-controls', 'new');
    loadCategoryProducts('bestsellers-list', 'bestsellers-pagination-controls', 'bestsellers');
    loadCategoryProducts('recommended-list', 'recommended-pagination-controls', 'recommended');
    document.getElementById('newsletterForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await sendNewsletterEmail();
        document.getElementById('newsletterForm').reset();
    });
});

// Funktion: Produkte für eine Kategorie laden
function loadCategoryProducts(listId, paginationId, category) {

    const apiUrlMap = {
        new: "/products/new",
        bestsellers: "/products/bestseller",
        recommended: "/products/recommended"
    };

    // Rufe den passenden API-Endpunkt basierend auf der Kategorie ab
    const apiUrl = apiUrlMap[category];

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            const shuffledProducts = data.slice(0, totalProducts); // Daten verwenden
            paginateProducts(shuffledProducts, listId, paginationId, category);
        })
        .catch(error => console.error('Fehler beim Laden der Produkte:', error));
}


// Funktion: Produkte in Seiten aufteilen
function paginateProducts(products, listId, paginationId, category) {
    const totalPages = Math.ceil(products.length / productsPerPage); // Anzahl der Seiten berechnen

    const start = currentPage[category] * productsPerPage; // Startindex für die aktuelle Seite
    const end = start + productsPerPage; // Endindex
    displayProducts(products.slice(start, end), listId); // Zeige die Produkte der aktuellen Seite

    const paginationControls = document.getElementById(paginationId);
    paginationControls.innerHTML = ''; // Navigation zurücksetzen

    // Vorheriger Button
    if (currentPage[category] > 0) {
        const prevButton = document.createElement('button');
        prevButton.textContent = '◀️';
        prevButton.className = 'btn btn-primary me-2';
        prevButton.onclick = () => {
            currentPage[category]--; // Seite zurücksetzen
            paginateProducts(products, listId, paginationId, category);
        };
        paginationControls.appendChild(prevButton);
    }

    // Nächster Button
    if (currentPage[category] < totalPages - 1) {
        const nextButton = document.createElement('button');
        nextButton.textContent = '▶️';
        nextButton.className = 'btn btn-primary';
        nextButton.onclick = () => {
            currentPage[category]++; // Seite erhöhen
            paginateProducts(products, listId, paginationId, category);
        };
        paginationControls.appendChild(nextButton);
    }
}

function displayProducts(products, listId) {
    const productList = document.getElementById(listId);
    productList.innerHTML = ''; // Vorherigen Inhalt löschen

    products.forEach(product => {
        const productElement = document.createElement('div');
        productElement.className = 'product'; // CSS-Klasse für das Styling
        productElement.innerHTML = `
      <a href="/product?id=${product.id}" class="text-decoration-none">
        <img src="${product.thumbnail}" alt="${product.title}">
        <div class="details">
          <h5>${product.title}</h5>
          <p>Preis: ${product.price} €</p>
        </div>
      </a>
      `;
        productList.appendChild(productElement); // Produkt-Element zur Liste hinzufügen
    });
}


async function postDataToUrl(url, data) {
    try {
        const response = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.error('Error while Posting Data to URL: ' + url, error);
    }
}

// Funktion zum Senden der E-Mail an das Backend
/**
 *
 * @returns {Promise<void>}
 */
async function sendNewsletterEmail() {
    const newsletterEmail = document.getElementById('email').value
    await postDataToUrl('/newsletter', {email: newsletterEmail})

}



