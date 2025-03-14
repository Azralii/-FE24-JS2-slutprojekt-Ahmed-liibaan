# Scrum Board

## Projektbeskrivning

Scrum Board är en applikation som används för att hantera uppgifter i ett Scrum-team. Applikationen tillåter användare att skapa uppgifter, tilldela dessa till medlemmar, och följa upp uppgifternas status (ny, pågående eller utförd). Den möjliggör även filtrering och sortering av uppgifter baserat på olika kriterier som kategori, tilldelad medlem, och tidsstämpel.

### Funktioner

**Skapa teammedlemmar:**
   Lägga till teammedlemmar med specifika roller (UX designer, frontend developer, backend developer).

**Skapa uppgifter:**
  Uppgifter kan skapas med titel, beskrivning, kategori och får automatiskt en tidsstämpel.

**Tilldela uppgifter:**
   Tilldela uppgifter till specifika teammedlemmar.

**Status på uppgifter:**
   Uppgifter kan ha tre status: "Ny", "Pågående" och "Utförd".
   
**Filtrering och Sortering:**
  Filtrera uppgifter baserat på tilldelad medlem och kategori.
   Sortera uppgifter baserat på timestamp (nyaste först eller äldsta först) samt titel.

### Användargränssnitt

**Tre Kolumner:**
**Ny Uppgift**: Visa uppgifter som är skapade men inte tilldelade ännu.
**Pågående**: Visa uppgifter som är tilldelade och under arbete.
**Utförd**: Visa uppgifter som är klara och utförda.

**Varje uppgift ska visa:**
Titel
Beskrivning
Kategori
Tidsstämpel
Tilldelad medlem (för pågående och utförd uppgift)
Åtgärder som att markera som "done" eller ta bort en uppgift.



## Teknologier och Verktyg

**Frontend:**
HTML, CSS och JavaScript/TypeScript för att bygga och designa användargränssnittet.
  
**Backend:**
Firebase används för att lagra uppgifter och medlemmar i realtidsdatabasen.

**Beroenden:**
Firebase SDK
TypeScript (för stark typning och bättre utvecklingsupplevelse)
  
**Programmeringsprinciper:**
**Objektorienterad programmering (OOP)** används för att skapa och hantera objekt som medlemmar och uppgifter.
**Funktionell programmering** används för att hantera filtrering, sortering och transformation av uppgifter.



## Installationsguide

**Klona repoet:**

   bash
   git clone https://github.com/ditt-användarnamn/scrum-board.git
