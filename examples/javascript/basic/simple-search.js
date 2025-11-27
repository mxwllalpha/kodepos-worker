/**
 * Simple Search Example
 * Basic postal code search functionality
 *
 * This example demonstrates the simplest way to search for postal codes
 * using the Kodepos API Indonesia.
 */

const API_BASE_URL = 'https://your-api.workers.dev';

/**
 * Simple search function
 * @param {string} query - Search query (village, district, city, or postal code)
 * @returns {Promise<Object>} Search results
 */
async function searchPostalCodes(query) {
  if (!query || typeof query !== 'string') {
    throw new Error('Query is required and must be a string');
  }

  if (query.trim().length < 2) {
    return {
      statusCode: 400,
      code: 'INVALID_QUERY',
      data: [],
      error: 'Query must be at least 2 characters long'
    };
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/search?q=${encodeURIComponent(query.trim())}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error('Search failed:', error);
    return {
      statusCode: 500,
      code: 'SEARCH_ERROR',
      data: [],
      error: error.message
    };
  }
}

/**
 * Display search results in a user-friendly format
 * @param {Object} results - API response data
 */
function displayResults(results) {
  if (results.statusCode !== 200) {
    console.error('Search failed:', results.error || results.code);
    return;
  }

  const { data } = results;

  if (!data || data.length === 0) {
    console.log('No results found for your search query.');
    return;
  }

  console.log(`Found ${data.length} results:`);
  console.log('─'.repeat(50));

  data.forEach((item, index) => {
    console.log(`${index + 1}. ${item.village}`);
    console.log(`   Postal Code: ${item.code}`);
    console.log(`   District: ${item.district}`);
    console.log(`   Regency: ${item.regency}`);
    console.log(`   Province: ${item.province}`);
    console.log(`   Coordinates: ${item.latitude}, ${item.longitude}`);
    console.log(`   Timezone: ${item.timezone}`);
    if (item.elevation) {
      console.log(`   Elevation: ${item.elevation}m`);
    }
    console.log('');
  });
}

/**
 * Interactive search function
 * Asks user for input and displays results
 */
async function interactiveSearch() {
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const askQuestion = (question) => {
    return new Promise((resolve) => {
      readline.question(question, resolve);
    });
  };

  console.log('🔍 Kodepos API Indonesia - Simple Search');
  console.log('==========================================');
  console.log('Enter location names, postal codes, or administrative areas');
  console.log('Examples: "Jakarta", "Menteng", "10110", "DKI Jakarta"');
  console.log('Type "exit" to quit\n');

  while (true) {
    const query = await askQuestion('🔍 Search: ');

    if (query.toLowerCase() === 'exit') {
      break;
    }

    if (!query.trim()) {
      console.log('⚠️  Please enter a search term\n');
      continue;
    }

    console.log('\n🔍 Searching...');
    const results = await searchPostalCodes(query.trim());
    displayResults(results);
    console.log('─'.repeat(50));
  }

  readline.close();
  console.log('\n👋 Goodbye!');
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    searchPostalCodes,
    displayResults,
    interactiveSearch
  };
}

// Run interactive search if this file is executed directly
if (typeof require !== 'undefined' && require.main === module) {
  interactiveSearch().catch(console.error);
}

// Example usage for browser environment
if (typeof window !== 'undefined') {
  // Browser example
  async function browserSearchExample() {
    const examples = [
      'Jakarta',
      'Surabaya',
      'Bali',
      'Bandung',
      '10110'
    ];

    console.log('Browser Search Examples:');
    console.log('=========================');

    for (const query of examples) {
      console.log(`\nSearching for: ${query}`);
      const results = await searchPostalCodes(query);

      if (results.statusCode === 200 && results.data.length > 0) {
        console.log(`✅ Found ${results.data.length} results`);
        const first = results.data[0];
        console.log(`   First result: ${first.village}, ${first.code}`);
      } else {
        console.log(`❌ No results found`);
      }
    }
  }

  // Make available globally for browser console
  window.kodeposSimpleSearch = {
    searchPostalCodes,
    displayResults,
    runExample: browserSearchExample
  };

  console.log('🚀 Kodepos Simple Search loaded!');
  console.log('Available functions:');
  console.log('- kodeposSimpleSearch.searchPostalCodes("Jakarta")');
  console.log('- kodeposSimpleSearch.runExample()');
}