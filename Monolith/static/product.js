document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    const productId = params.get("id");

    if (productId) {
        const product = await fetchProductDetails(productId);
        displayProductDetails(product)
        addFormEventListener(productId);
        await loadCategoryProducts(productId);
        await displayStars(productId);
        await displayReviews(productId);
    }

});

function addFormEventListener(productId) {
    document.getElementById('reviewForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await sendReview(productId);
        document.getElementById('reviewForm').reset();
    });
    document.getElementById('newsletterForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await sendNewsletterEmail();
        document.getElementById('newsletterForm').reset();
    });
}


// Produktdetails vom Backend abrufen
async function fetchProductDetails(productId) {
    const apiUrl = `/products/${productId}`;
    const response = await fetch(apiUrl);
    if (!response.ok) {
        throw new Error(`Fehler beim Abrufen der Produktdaten: ${response.status}`);
    }
    return await response.json();
}

// Produktdetails im DOM anzeigen
function displayProductDetails(product) {
    document.getElementById("product-name").textContent = product.title;
    document.getElementById("product-price").textContent = `Preis: ${product.price} €`;
    document.getElementById("product-img").src = product.thumbnail;
}

async function loadCategoryProducts(productId) {
    const apiUrl = `/products/similar_items/${productId}`; // Backend URL
    const similarProducts = await fetchDataFromUrl(apiUrl);
    console.log(similarProducts)

    if (similarProducts && similarProducts.length > 0) {
        paginateProducts(similarProducts); // Paginierung starten
    } else {
        console.error("Keine ähnlichen Produkte gefunden:", similarProducts);
    }
}

function paginateProducts(similar_products) {
    console.log("Produkte für Paginierung:", similar_products);

    let currentPage = 0;
    const productsPerPage = 3;

    displaySimilarProductsList(similar_products, currentPage);

    const backButton = document.getElementById("previous-button");
    const nextButton = document.getElementById("next-button");

    backButton.style.display = currentPage === 0 ? "none" : "inline-block";
    nextButton.style.display =
        currentPage >= Math.ceil(similar_products.length / productsPerPage) - 1
            ? "none"
            : "inline-block";

    backButton.addEventListener("click", () => {
        if (currentPage > 0) {
            currentPage--;
            displaySimilarProductsList(similar_products, currentPage);
        }
        backButton.style.display = currentPage === 0 ? "none" : "inline-block";
        nextButton.style.display =
            currentPage >= Math.ceil(similar_products.length / productsPerPage) - 1
                ? "none"
                : "inline-block";
    });

    nextButton.addEventListener("click", () => {
        if (currentPage < Math.ceil(similar_products.length / productsPerPage) - 1) {
            currentPage++;
            displaySimilarProductsList(similar_products, currentPage);
        }
        backButton.style.display = currentPage === 0 ? "none" : "inline-block";
        nextButton.style.display =
            currentPage >= Math.ceil(similar_products.length / productsPerPage) - 1
                ? "none"
                : "inline-block";
    });
}


function displaySimilarProductsList(products, currentPage) {
    console.log("Produkte für Anzeige:", products);

    const productsPerPage = 3;
    const start = currentPage * productsPerPage;
    const end = start + productsPerPage;

    const productList = document.getElementById("similar-list");
    productList.innerHTML = "";

    products.slice(start, end).forEach((product) => {
        const productElement = document.createElement("div");
        productElement.className = "product";
        productElement.innerHTML = `
            <a href="/product?id=${product.id}" class="text-decoration-none">
                <img src="${product.thumbnail}" alt="${product.title}">
                <div class="details">
                    <h5>${product.title}</h5>
                    <p>Preis: ${product.price} €</p>
                </div>
            </a>`;
        productList.appendChild(productElement);
    });
}



// Bewertungen anzeigen
async function displayReviews(productId) {
    const apiUrl = `/products/${productId}/reviews`;
    const reviews = await fetchDataFromUrl(apiUrl);
    const reviewList = document.getElementById("review-list");
    reviewList.innerHTML = "";
    reviews.forEach(review => {
        const reviewElement = document.createElement("div");
        reviewElement.className = "review card mb-3 border";
        reviewElement.innerHTML = `
            <div class="card-body">
                <h5 class="card-title">${review.reviewerName}</h5>
                <h6 class="card-subtitle mb-2 text-muted">${review.rating} ★</h6>
                <p class="card-text">${review.comment}</p>
            </div>`;
        reviewList.appendChild(reviewElement);
    });
}

// Bewertung in Sternen anzeigen
async function displayStars(productId, maxStars = 5) {
    const starDiv = document.getElementById("rating");
    starDiv.innerHTML = "";
    const apiUrl = `/products/${productId}/rating`;
    const rating = await fetchDataFromUrl(apiUrl);
    for (let i = 1; i <= maxStars; i++) {
        const star = document.createElement("span");
        star.textContent = i <= rating ? "★" : "☆";
        starDiv.appendChild(star);
    }
}

async function sendNewsletterEmail() {
    const newsletterEmail = document.getElementById('email').value
    await postDataToUrl('/newsletter', {email: newsletterEmail})
}

// Rezension absenden
async function sendReview(productId) {
    const name = document.getElementById('name').value
    const email = document.getElementById('review_email').value
    const rating = document.getElementById('product_rating').value
    const comment = document.getElementById('reviewText').value

    const review = {
        reviewerName: name,
        reviewerEmail: email,
        rating: rating,
        comment: comment
    }

    await postDataToUrl(`/products/${productId}/review`, review) // response: {"message": "Review saved successfully"}
    displayStars(productId); // Update Rating
    displayReviews(productId); // Update Reviews
    return false;
}



// Daten von einer URL laden
async function fetchDataFromUrl(url) {
    try {
        const response = await fetch(url);
        return await response.json();
    } catch (error) {
        console.error(`Fehler beim Laden der Daten von URL ${url}:`, error);
        return null;
    }
}

// Daten an eine URL senden
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
