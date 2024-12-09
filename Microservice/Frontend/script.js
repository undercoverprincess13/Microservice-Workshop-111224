const productsPerPage = 3; // products per page
const totalProducts = 20; // maximum products to display

//save the current page for each category
let currentPage = {
    new: 0,
    bestsellers: 0,
    recommended: 0
};

// start loading the products when the html page is loaded
document.addEventListener('DOMContentLoaded', async () => {
    loadCategoryProducts('new-products-list', 'new-pagination-controls', 'new');
    loadCategoryProducts('bestsellers-list', 'bestsellers-pagination-controls', 'bestsellers');
    loadCategoryProducts('recommended-list', 'recommended-pagination-controls', 'recommended');

    document.getElementById('newsletterForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await sendNewsletterEmail();
        document.getElementById('newsletterForm').reset();
    });
});

/**
 * Load the products for the given category
 * @param listId
 * @param paginationId
 * @param category
 */
function loadCategoryProducts(listId, paginationId, category) {

    const apiUrlMap = {
        new: "http://localhost:8080/products/new",
        bestsellers: "http://localhost:8080/products/bestseller",
        recommended: "http://localhost:8080/products/recommended"
    };

    // Rufe den passenden API-Endpunkt basierend auf der Kategorie ab
    const apiUrl = apiUrlMap[category];

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            const shuffledProducts = data.slice(0, totalProducts);
            paginateProducts(shuffledProducts, listId, paginationId, category);
        })
        .catch(error => console.error('Fehler beim Laden der Produkte:', error));
}

/**
 * Paginate the products for the given category
 * @param products
 * @param listId
 * @param paginationId
 * @param category
 */
function paginateProducts(products, listId, paginationId, category) {
    const totalPages = Math.ceil(products.length / productsPerPage)

    const start = currentPage[category] * productsPerPage;
    const end = start + productsPerPage;
    displayProducts(products.slice(start, end), listId); // show the producs for the current page

    const paginationControls = document.getElementById(paginationId);
    paginationControls.innerHTML = '';

    // Previous Button
    if (currentPage[category] > 0) {
        const prevButton = document.createElement('button');
        prevButton.textContent = '◀️';
        prevButton.className = 'btn btn-primary me-2';
        prevButton.onclick = () => {
            currentPage[category]--; // set back the page
            paginateProducts(products, listId, paginationId, category);
        };
        paginationControls.appendChild(prevButton);
    }

    // Next Button
    if (currentPage[category] < totalPages - 1) {
        const nextButton = document.createElement('button');
        nextButton.textContent = '▶️';
        nextButton.className = 'btn btn-primary';
        nextButton.onclick = () => {
            currentPage[category]++;
            paginateProducts(products, listId, paginationId, category);
        };
        paginationControls.appendChild(nextButton);
    }
}

function displayProducts(products, listId) {
    const productList = document.getElementById(listId);
    productList.innerHTML = '';

    products.forEach(product => {
        const productElement = document.createElement('div');
        productElement.className = 'product';
        productElement.innerHTML = `
      <a href="product.html?id=${product.id}" class="text-decoration-none">
        <img src="${product.thumbnail}" alt="${product.title}">
        <div class="details">
          <h5>${product.title}</h5>
          <p>Preis: ${product.price} €</p>
        </div>
      </a>
      `;
        productList.appendChild(productElement);
    });
}

/**
 * Post data to the given URL
 * @param url
 * @param data
 * @returns {Promise<void>}
 */
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

/**
 * Send the newsletter email
 * @returns {Promise<void>}
 */
async function sendNewsletterEmail() {
    const newsletterEmail = document.getElementById('email').value
    const responseMessageNewsletter = document.getElementById('newsletter_responseMessage');
    const response = await postDataToUrl('http://localhost:8080/newsletter/newsletter', {email: newsletterEmail})
    responseMessageNewsletter.textContent = 'Vielen Dank für Ihre Anmeldung zum Newsletter!';

}


