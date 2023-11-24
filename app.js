new Vue({
            el: '#app',
            data: {
                apiUrl: 'https://api.github.com/repos/2023PAL/youcanthide/contents/reports/',
                documents: [],
                searchTerm: '',
                searchResults: [],
                selectedDocument: null,
                renderedDocument: ''
            },
            mounted() {
                this.fetchDocuments(this.apiUrl);
                document.addEventListener('click', this.handleClickOutside);
            },
            methods: {
                async fetchDocuments(url) {
            try {
                const response = await fetch(url);
                const data = await response.json();

                for (const item of data) {
                    if (item.type === 'file' && item.name.endsWith('.md')) {
                        this.documents.push({
                            name: item.name,
                            download_url: item.download_url,
                            html_url: item.html_url
                        });
                    } else if (item.type === 'dir') {
                        // If it's a directory, recursively fetch documents in the directory
                        await this.fetchDocuments(item.url);
                    }
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        },
                selectDocument(document) {
    fetch(document.download_url)
        .then(response => response.text())
        .then(content => {
            // Parse the markdown content to extract h2 titles
            const parser = new DOMParser();
            const parsedDoc = parser.parseFromString(marked(content), 'text/html');
            const h2Title = parsedDoc.querySelector('h2');

            // Determine the class based on the folder
            const indicatorClass = this.isInInstitutionsFolder(document)
                ? 'indicator indicator-institutions'
                : 'indicator indicator-individuals';

            // Add indicator to the first h2 title
            if (h2Title) {
                // Create the indicator
                const indicator = parsedDoc.createElement('span');
                indicator.className = indicatorClass;
                indicator.style.marginLeft = '8px'; // Adjust the space between text and indicator
                indicator.style.verticalAlign = 'middle'; // Center the indicator vertically

                // Clone the h2 title and clear its content
                const clonedTitle = h2Title.cloneNode(true);
                clonedTitle.innerHTML = '';

                // Check if the original h2 title contains a hyperlink
                const originalLink = h2Title.querySelector('a');
                if (originalLink) {
                    // Clone the original link and append the indicator
                    const clonedLink = originalLink.cloneNode(true);
                    clonedLink.appendChild(parsedDoc.createTextNode(' ')); // Add space
                    clonedLink.appendChild(indicator);
                    clonedTitle.appendChild(clonedLink);
                } else {
                    // If no hyperlink, append the text and indicator
                    clonedTitle.appendChild(parsedDoc.createTextNode(' ')); // Add space
                    clonedTitle.appendChild(parsedDoc.createTextNode(h2Title.textContent.trim())); // Add the text
                    clonedTitle.appendChild(indicator);
                }
                
                clonedTitle.style.backgroundColor = '#b1b3b1'; // Adjust the color as needed

                // Replace the original h2 title with the modified cloned title
                h2Title.parentNode.replaceChild(clonedTitle, h2Title);
            }

            this.renderedDocument = parsedDoc.body.innerHTML;
        })
        .catch(error => console.error('Error fetching document:', error))
        .finally(() => {
            // Close the dropdown after rendering the content
            this.searchResults = [];
        });

    // Set the selected document after fetching the content
    this.selectedDocument = document;
},
                searchDocuments() {
                    this.searchResults = this.documents.filter(document =>
                        document.name.toLowerCase().includes(this.searchTerm.toLowerCase())
                    );
                },
                closeDropdown(event) {
                    // Close the dropdown when input loses focus
                    this.searchResults = [];
                },
                handleClickOutside(event) {
                    // Close the dropdown when clicking outside of the search dropdown
                    const searchContainer = this.$refs.searchContainer;
                    if (searchContainer && !searchContainer.contains(event.target)) {
                        this.searchResults = [];
                    }
                },
                removeExtension(filename) {
                // Use this method to remove the extension '.md' from the filename
                return filename.replace(/\.[^/.]+$/, "");
            	},
            	isInInstitutionsFolder(result) {
            return result && result.html_url && result.html_url.includes('/institutions/');
        },

        isInIndividualsFolder(result) {
            return result && result.html_url && result.html_url.includes('/individuals/');
        },
            },
            beforeDestroy() {
               document.removeEventListener('click', this.handleClickOutside);
            }
        });
