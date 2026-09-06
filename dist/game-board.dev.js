"use strict";

function fetchCards(url) {
  var response, data;
  return regeneratorRuntime.async(function fetchCards$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _context.next = 3;
          return regeneratorRuntime.awrap(fetch(url));

        case 3:
          response = _context.sent;

          if (response.ok) {
            _context.next = 6;
            break;
          }

          throw new Error('Failed to fetch cards');

        case 6:
          _context.next = 8;
          return regeneratorRuntime.awrap(response.json());

        case 8:
          data = _context.sent;
          return _context.abrupt("return", data);

        case 12:
          _context.prev = 12;
          _context.t0 = _context["catch"](0);
          console.error('Error fetching cards:', _context.t0);
          throw _context.t0;

        case 16:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 12]]);
}

function loadPlayerHand() {
  var playerHand;
  return regeneratorRuntime.async(function loadPlayerHand$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          _context2.next = 3;
          return regeneratorRuntime.awrap(fetchCards('/api/player-hand'));

        case 3:
          playerHand = _context2.sent;
          // Adjust URL as needed
          console.log('Player Hand:', playerHand); // Example: Log the fetched data
          // Handle displaying player hand cards in your game interface

          _context2.next = 10;
          break;

        case 7:
          _context2.prev = 7;
          _context2.t0 = _context2["catch"](0);
          console.error('Error loading player hand:', _context2.t0); // Handle error (e.g., display error message to user)

        case 10:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[0, 7]]);
}

function loadBattlefield() {
  var battlefield;
  return regeneratorRuntime.async(function loadBattlefield$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.prev = 0;
          _context3.next = 3;
          return regeneratorRuntime.awrap(fetchCards('/api/battlefield'));

        case 3:
          battlefield = _context3.sent;
          // Adjust URL as needed
          console.log('Battlefield:', battlefield); // Example: Log the fetched data
          // Handle displaying battlefield cards in your game interface

          _context3.next = 10;
          break;

        case 7:
          _context3.prev = 7;
          _context3.t0 = _context3["catch"](0);
          console.error('Error loading battlefield:', _context3.t0); // Handle error (e.g., display error message to user)

        case 10:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[0, 7]]);
}

function drawCard() {
  var newCardData;
  return regeneratorRuntime.async(function drawCard$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          console.log('Draw Card button clicked'); // Add console log to check if function is called

          try {
            // Placeholder for fetch logic or any other action
            console.log('Fetching new card data...'); // Add console log for debugging fetch
            // Example: Simulate fetching card data

            newCardData = {
              id: 1,
              name: 'New Card',
              type: 'Creature',
              power: 3,
              toughness: 2
            }; // Example: Update UI or do something with newCardData

            console.log('New card fetched:', newCardData); // Log fetched card data for debugging
          } catch (error) {
            console.error('Error drawing card:', error); // Handle error (e.g., display error message to user)
          }

        case 2:
        case "end":
          return _context4.stop();
      }
    }
  });
}

function fetchNewCard() {
  var response, newCard;
  return regeneratorRuntime.async(function fetchNewCard$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          _context5.prev = 0;
          _context5.next = 3;
          return regeneratorRuntime.awrap(fetch('/api/cards', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            // Example body: Adjust based on your card data structure
            body: JSON.stringify({
              playerId: 1
            }) // Assuming playerId 1 is hardcoded for example

          }));

        case 3:
          response = _context5.sent;

          if (response.ok) {
            _context5.next = 6;
            break;
          }

          throw new Error('Failed to fetch new card');

        case 6:
          _context5.next = 8;
          return regeneratorRuntime.awrap(response.json());

        case 8:
          newCard = _context5.sent;
          return _context5.abrupt("return", newCard);

        case 12:
          _context5.prev = 12;
          _context5.t0 = _context5["catch"](0);
          console.error('Error fetching new card:', _context5.t0);
          throw _context5.t0;

        case 16:
        case "end":
          return _context5.stop();
      }
    }
  }, null, null, [[0, 12]]);
}