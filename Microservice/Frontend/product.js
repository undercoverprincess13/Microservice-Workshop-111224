const productsPerPage = 3; // products per page

/**
 * add EventListener to the DOMContentLoaded event for the product page to load the product details
 */
document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id'); // Product-ID from URL


    if (productId) {
        await fetchProductDetails(productId);
        addFormEventListener(productId);
        await loadCategoryProducts(productId);
        await displayStars(productId);
        await displayReviews(productId);
    }

});

/**
 * adds EventListener to the review form and the newsletter form to send the data to the backend when button submit is clicked
 * @param productId
 */
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

/**
 * Fetches data from the given URL and displays an error message if the fetch fails
 * @param url
 * @param errormessage (error = [{"id": "similar-list", "message": '<h3>Keine ähnlichen Produkte gefunden</h3>'}, ...])
 * @returns {Promise<any>}
 */
async function fetchDataFromUrl(url, errormessage) {
    try {
        const response = await fetch(url);
        return await response.json();
    } catch (fetchError) {
        console.error('Error while Loading Data from URL: ' + url, fetchError);

        for (let i = 0; i < errormessage.length; i++) {
            document.getElementById(errormessage[i].id).innerHTML = errormessage[i].message;
            console.log(errormessage[i].message + "test!");
        }

    }
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
 * loads the product details from the backend and displays them in the DOM
 * @param productId
 * @returns {Promise<*>}
 */
async function fetchProductDetails(productId) {
    const apiUrl = `http://localhost:8080/products/products/${productId}`;
    const error = [
        {'id': 'product-name', 'message': '<h1>Fehler: Produktname nicht gefunden</h1>'},
        {'id': 'product-price', 'message': '<h1>Fehler: Produktpreis nicht gefunden</h1>'},
        {'id': 'product-img', 'message': '<h1>Fehler: Produktbild nicht gefunden</h1>'}
    ]
    const product = await fetchDataFromUrl(apiUrl, error);

    if (!product) {
        return;
    }
    // add product details to the DOM
    document.getElementById('product-name').textContent = product['title'];
    document.getElementById('product-price').textContent = `Preis: ${product['price']} €`;
    document.getElementById('product-img').src = product['thumbnail'];

    return product;
}

/**
 * Fetches similar products from the backend and displays them in the DOM
 * @param product_id
 * @returns {Promise<void>}
 */
async function loadCategoryProducts(product_id) {
    const apiUrl = `http://localhost:8080/products/similar_items/${product_id}`
    const similar_products = await fetchDataFromUrl(apiUrl, [{
        "id": "similar-list",
        "message": '<h3>Keine ähnlichen Produkte gefunden</h3>'
    }])

    if (similar_products && similar_products.length > 0) {
        paginateProducts(similar_products)
    } else {
        console.log("Error loading products from category. " + similar_products);
    }
}

/**
 * Paginates the similar products and displays them in the DOM
 * @param similar_products
 */
function paginateProducts(similar_products) {
    let currentPage = 0; // Initialize currentPage

    // Render the initial product list and buttons
    displaySimilarProductsList(similar_products, currentPage);

    const backButton = document.getElementById('previous-button');
    const nextButton = document.getElementById('next-button');
    backButton.style.display = currentPage === 0 ? 'none' : 'inline-block'
    nextButton.style.display = currentPage >= (similar_products.length - 1) / productsPerPage ? 'none' : 'inline-block';

    backButton.addEventListener('click', (e) => {
        e.preventDefault();
        currentPage--;
        displaySimilarProductsList(similar_products, currentPage);
        backButton.style.display = currentPage === 0 ? 'none' : 'inline-block'
        nextButton.style.display = currentPage + 1 >= similar_products.length / productsPerPage ? 'none' : 'inline-block';
    })

    nextButton.addEventListener('click', (e) => {
        e.preventDefault();
        currentPage++;
        displaySimilarProductsList(similar_products, currentPage);
        backButton.style.display = currentPage === 0 ? 'none' : 'inline-block'
        nextButton.style.display = currentPage + 1 >= similar_products.length / productsPerPage ? 'none' : 'inline-block';
    })
}

/**
 * Displays the similar products in the DOM
 * @param products
 * @param currentPage
 */
function displaySimilarProductsList(products, currentPage) {
    const start = currentPage * productsPerPage; // start index for the current page
    const end = start + productsPerPage; // end index for the current page

    const productList = document.getElementById('similar-list');
    productList.innerHTML = ''; // delete previous content

    products.slice(start, end).forEach(product => {
        const productElement = document.createElement('div');
        productElement.className = 'product';
        productElement.innerHTML = showProductDetailsHTML(product);
        productList.appendChild(productElement); // add product element to the list
    });
}

/**
 * Fetches the rating from the backend and displays the stars in the DOM
 * @param product_id
 * @param maxStars
 * @returns {Promise<void>}
 */
async function displayStars(product_id, maxStars = 5) {
    const starDiv = document.getElementById('rating');
    starDiv.innerHTML = ``
    const apiUrl = `http://localhost:8080/reviews/${product_id}/rating`

    const rating = await fetchDataFromUrl(apiUrl, [{"id": "rating", "message": '<h3>Keine Bewertung gefunden</h3>'}])
    if (!rating) {
        return;
    }

    for (let i = 1; i <= maxStars; i++) {
        const star = document.createElement('span');
        if (rating >= i || i - rating < 0.25) {
            star.className = 'star-full';
            star.textContent = '★';
        } else if (i - rating <= 0.75 && i - rating >= 0.25) {
            star.className = 'star-half';
            star.textContent = '★';
        } else {
            star.className = 'star-empty';
            star.textContent = '☆';
        }
        starDiv.appendChild(star);
    }
}

/**
 * uses the product data to set the data in the HTML
 * @param product
 * @returns {string}
 */
function showProductDetailsHTML(product) {
    return `
      <a href="product.html?id=${product['id']}" class="text-decoration-none">
        <img src="${product['thumbnail']}" alt="${product['title']}">
        <div class="details">
          <h5>${product.title}</h5>
          <p>Preis: ${product['price']} €</p>
        </div>
      </a>
      `;
}

/**
 * Fetches the reviews from the backend and displays them in the DOM
 * @param product_id
 * @returns {Promise<void>}
 */
async function displayReviews(product_id) {
    const apiUrl = `http://localhost:8080/reviews/${product_id}/reviews`
    const reviews = await fetchDataFromUrl(apiUrl, [{
        "id": "review-list",
        "message": '<h3>Keine Bewertungen gefunden</h3>'
    }])
    if (!reviews) {
        return;
    }
    const reviewList = document.getElementById('review-list');
    reviewList.innerHTML = '';
    for (let review of reviews) {
        const reviewElement = document.createElement('div');
        reviewElement.className = 'review card mb-3 border';
        reviewElement.style.width = '20%'
        reviewElement.innerHTML = `
            <div class="card-body">
                <h5 class="card-title">${review['reviewerName']}</h5>
                <h6 class="card-subtitle mb-2 text-muted">${review['rating']} ★</h6>
                <p class="card-text">${review['comment']}</p>
            </div>
        `;
        reviewList.appendChild(reviewElement);
    }
}

/**
 * Sends the newsletter email to the backend
 * @returns {Promise<void>}
 * TODO use alert instead of div
 */
async function sendNewsletterEmail() {
    const newsletterEmail = document.getElementById('email').value
    const responseMessageNewsletter = document.getElementById('newsletter_responseMessage');
    const response = await postDataToUrl('http://localhost:8080/newsletter/newsletter', {email: newsletterEmail})

    responseMessageNewsletter.textContent = 'Vielen Dank für Ihre Anmeldung zum Newsletter!';
}


/**
 * Sends the review to the backend
 * @param productId
 * @returns {Promise<boolean>}
 * TODO use alert instead of div
 */
async function sendReview(productId) {
    const name = document.getElementById('name').value
    const email = document.getElementById('review_email').value
    const rating = document.getElementById('product_rating').value
    const comment = document.getElementById('reviewText').value
    const responseMessage = document.getElementById('product_review_responseMessage');

    const review = {
        reviewerName: name,
        reviewerEmail: email,
        rating: rating,
        comment: comment
    }

    const response = await postDataToUrl(`http://localhost:8080/reviews/${productId}/review`, review)
    displayStars(productId); // Update Rating
    displayReviews(productId); // Update Reviews
    responseMessage.textContent = "Danke für die Rezension"
    return false;
}
