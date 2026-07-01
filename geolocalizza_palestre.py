import csv
import time
import requests
from urllib.parse import quote

# Lista COMPLETA di tutte le palestre delle 6 zone
palestre = [
    # ZONA 1 - Treviso Città e Prima Cintura
    {"zona": 1, "comune": "Treviso", "nome": "FitActive Treviso", "indirizzo": "Viale IV Novembre, 93/A, Treviso"},
    {"zona": 1, "comune": "Treviso", "nome": "Show Club La Ghirada", "indirizzo": "Via Nascimben, 1/B, Treviso"},
    {"zona": 1, "comune": "Treviso", "nome": "My Gym City", "indirizzo": "Via Terraglio, 156, Treviso"},
    {"zona": 1, "comune": "Treviso", "nome": "Strada Facendo Indoor", "indirizzo": "Via Tommaso Salsa, 2/A, Treviso"},
    {"zona": 1, "comune": "Treviso", "nome": "Canoa Club Sile", "indirizzo": "Via Antonio Borin, 48/L, Treviso"},
    {"zona": 1, "comune": "Treviso", "nome": "Palestra Sports Team Treviso", "indirizzo": "Treviso"},
    {"zona": 1, "comune": "Villorba", "nome": "Renton Fitness", "indirizzo": "Via Roma, 47, Villorba"},
    {"zona": 1, "comune": "Villorba", "nome": "K Fitness Club", "indirizzo": "Via Thomas Alva Edison, 119/121, Villorba"},
    {"zona": 1, "comune": "Villorba", "nome": "Biverso Fitness Lab", "indirizzo": "Viale della Repubblica, 22, Villorba"},
    {"zona": 1, "comune": "Villorba", "nome": "Park Tennis Villorba", "indirizzo": "Via Fratelli Rosselli, 30, Villorba"},
    {"zona": 1, "comune": "Villorba", "nome": "Palestra Sport Evolution", "indirizzo": "Villorba"},
    {"zona": 1, "comune": "Mogliano Veneto", "nome": "CIAO Fitness House", "indirizzo": "Via Ronzinella, 99/B, Mogliano Veneto"},
    {"zona": 1, "comune": "Mogliano Veneto", "nome": "Teen Eleven Evolution", "indirizzo": "Via Prà dei Roveri, 4, Mogliano Veneto"},
    {"zona": 1, "comune": "Mogliano Veneto", "nome": "Centro Sportivo Via Torni", "indirizzo": "Via Torni, 51, Mogliano Veneto"},
    {"zona": 1, "comune": "Mogliano Veneto", "nome": "Polisportiva Mogliano", "indirizzo": "Via Erminio Ferretto, 2, Mogliano Veneto"},
    {"zona": 1, "comune": "Mogliano Veneto", "nome": "Fitness Avenue", "indirizzo": "Mogliano Veneto"},
    {"zona": 1, "comune": "Paese", "nome": "Vitanova Fitness", "indirizzo": "Via Postumia, 153, Paese"},
    {"zona": 1, "comune": "Paese", "nome": "FitUP Paese", "indirizzo": "Paese"},
    {"zona": 1, "comune": "Silea", "nome": "Dream Studio", "indirizzo": "Via Treviso, 29, Silea"},
    {"zona": 1, "comune": "Silea", "nome": "Papy Academy", "indirizzo": "Via Treviso, 34, Silea"},
    {"zona": 1, "comune": "Silea", "nome": "MoveLab Climbing", "indirizzo": "Silea"},
    {"zona": 1, "comune": "Silea", "nome": "Sportler Climbing Center", "indirizzo": "Via Combattenti Alleati, 1, Silea"},
    {"zona": 1, "comune": "Preganziol", "nome": "Fit And Go", "indirizzo": "Via Terraglio, 243/A, Preganziol"},
    {"zona": 1, "comune": "Preganziol", "nome": "Polisportiva Preganziol", "indirizzo": "Via Giacomo Matteotti, 2, Preganziol"},
    {"zona": 1, "comune": "Preganziol", "nome": "Phision", "indirizzo": "Via Terraglio, 166, Preganziol"},
    {"zona": 1, "comune": "Casier", "nome": "Bamboo Fitness", "indirizzo": "Via Alessandro Volta, 12/A, Dosson di Casier"},
    {"zona": 1, "comune": "Casier", "nome": "Polisportiva Casier", "indirizzo": "Via Enrico Fermi, 1, Dosson di Casier"},
    {"zona": 1, "comune": "Casale sul Sile", "nome": "H.O.G. Fitness", "indirizzo": "Viale delle Industrie, 6, Casale sul Sile"},
    {"zona": 1, "comune": "Casale sul Sile", "nome": "Aquafit", "indirizzo": "Via Belvedere, 59, Casale sul Sile"},
    {"zona": 1, "comune": "Casale sul Sile", "nome": "Polisportiva Casale", "indirizzo": "Casale sul Sile"},
    {"zona": 1, "comune": "Ponzano Veneto", "nome": "ASD AREA", "indirizzo": "Via Piave, 1/B, Ponzano Veneto"},
    {"zona": 1, "comune": "Ponzano Veneto", "nome": "ASD Kalèidos", "indirizzo": "Via Dogi, 1, Ponzano Veneto"},
    {"zona": 1, "comune": "Carbonera", "nome": "C.S. Artistic Gym", "indirizzo": "Via G. Garibaldi, 1, Carbonera"},
    {"zona": 1, "comune": "Carbonera", "nome": "Volley Carbonera ASD", "indirizzo": "Via Primo Maggio, 56, Carbonera"},
    {"zona": 1, "comune": "Quinto di Treviso", "nome": "QuintoSenso", "indirizzo": "Via Zagaria, 2/20, Quinto di Treviso"},
    {"zona": 1, "comune": "Quinto di Treviso", "nome": "Energym Sport e Benessere", "indirizzo": "Via San Cassiano, 27, Quinto di Treviso"},
    {"zona": 1, "comune": "Quinto di Treviso", "nome": "Remedium Medical Hub", "indirizzo": "Via Postumia, 12, Quinto di Treviso"},
    {"zona": 1, "comune": "Zero Branco", "nome": "FitUP Zero Branco", "indirizzo": "Via Treviso, 19, Zero Branco"},
    {"zona": 1, "comune": "Zero Branco", "nome": "La Fenice ASD", "indirizzo": "Via G. Taliercio, 5, Zero Branco"},
    {"zona": 1, "comune": "Roncade", "nome": "Baobab Fitness Club", "indirizzo": "Via Tintoretto, 22, Roncade"},
    {"zona": 1, "comune": "Roncade", "nome": "Roncade Basket ASD", "indirizzo": "Roncade"},
    {"zona": 1, "comune": "Monastier di Treviso", "nome": "Rosa Blu Village", "indirizzo": "Via Pisani, 12, Monastier di Treviso"},
    {"zona": 1, "comune": "Monastier di Treviso", "nome": "Polisportiva Monastier '88", "indirizzo": "Via XXV Aprile, Monastier di Treviso"},
    {"zona": 1, "comune": "Arcade", "nome": "Centro Acquamagia", "indirizzo": "Via Roma, 155, Arcade"},
    {"zona": 1, "comune": "Morgano", "nome": "Sporting Club Morgano", "indirizzo": "Via Chiesa, 35, Morgano"},
    {"zona": 1, "comune": "Istrana", "nome": "Labofit", "indirizzo": "Via Brigata Marche, 1/A, Istrana"},
    {"zona": 1, "comune": "Istrana", "nome": "E-Motion Fitness Club", "indirizzo": "Via Fabio Filzi, 48/A, Istrana"},
    {"zona": 1, "comune": "Spresiano", "nome": "Palestra Comunale", "indirizzo": "Spresiano"},
    
    # ZONA 2 - Montebellunese, Asolano e Pedemontana
    {"zona": 2, "comune": "Montebelluna", "nome": "Top Gym Montebelluna", "indirizzo": "Via Castellana, 103, Montebelluna"},
    {"zona": 2, "comune": "Montebelluna", "nome": "FitUP Montebelluna", "indirizzo": "Via Schiavonesca Priula, 72, Montebelluna"},
    {"zona": 2, "comune": "Montebelluna", "nome": "DG Club Montebelluna", "indirizzo": "Via Feltrina Sud, 84, Montebelluna"},
    {"zona": 2, "comune": "Asolo", "nome": "Miafit Asolo", "indirizzo": "Via Enrico Fermi, 10, Casella d'Asolo"},
    {"zona": 2, "comune": "Asolo", "nome": "Asolo Fitness Club", "indirizzo": "Asolo"},
    {"zona": 2, "comune": "Maser", "nome": "DG Club Maser", "indirizzo": "Via Enrico Mattei, 44, Maser"},
    {"zona": 2, "comune": "Maser", "nome": "Energya Fitness Club", "indirizzo": "Via Bassanese Coste, 156, Maser"},
    {"zona": 2, "comune": "Caerano di San Marco", "nome": "Esserebenessere S.r.l.", "indirizzo": "Caerano di San Marco"},
    {"zona": 2, "comune": "Caerano di San Marco", "nome": "A.S.D. Zerogravity 981", "indirizzo": "Caerano di San Marco"},
    {"zona": 2, "comune": "Fonte", "nome": "Palestra Fisyodinamic", "indirizzo": "Via Degli Alpini, 25, Fonte"},
    {"zona": 2, "comune": "Fonte", "nome": "Palafonte", "indirizzo": "Via Palladio, 11, Fonte"},
    {"zona": 2, "comune": "Borso del Grappa", "nome": "L'Anima del Fitness", "indirizzo": "Via Molinetto, 23, Borso del Grappa"},
    {"zona": 2, "comune": "Borso del Grappa", "nome": "Palestra di Arrampicata Indoor", "indirizzo": "Via Martiri del Grappa, 22, Borso del Grappa"},
    {"zona": 2, "comune": "Cornuda", "nome": "ASD Valdogym", "indirizzo": "Cornuda"},
    {"zona": 2, "comune": "Cornuda", "nome": "A.S.D. Zerogravity 981", "indirizzo": "Cornuda"},
    {"zona": 2, "comune": "Crocetta del Montello", "nome": "Crocetta 1920 Academy", "indirizzo": "Via Canapificio, Crocetta del Montello"},
    {"zona": 2, "comune": "Nervesa della Battaglia", "nome": "Centro Sportivo HOF", "indirizzo": "Via Luigi Carrer, 7, Nervesa della Battaglia"},
    {"zona": 2, "comune": "Volpago del Montello", "nome": "Invictus Fitness", "indirizzo": "Via Tagliamento, 11, Volpago del Montello"},
    {"zona": 2, "comune": "Giavera del Montello", "nome": "Palestra Comunale", "indirizzo": "Via degli Artiglieri, 14, Giavera del Montello"},
    {"zona": 2, "comune": "Giavera del Montello", "nome": "Campo OCR FIT POINT", "indirizzo": "Via delle Industrie, 1, Giavera del Montello"},
    {"zona": 2, "comune": "Altivole", "nome": "ASD Fast Fit", "indirizzo": "Via Laguna, 29, Altivole"},
    {"zona": 2, "comune": "Altivole", "nome": "Palestra Comunale San Vito", "indirizzo": "Via Brioni, 1, Altivole"},
    {"zona": 2, "comune": "Castelcucco", "nome": "A.S.D. Accademia Ginnica Castelcucco", "indirizzo": "Castelcucco"},
    {"zona": 2, "comune": "Cavaso del Tomba", "nome": "Loris De Martin Studio", "indirizzo": "Via Monte Ortigara, 37, Cavaso del Tomba"},
    {"zona": 2, "comune": "Cavaso del Tomba", "nome": "Palestra Comunale", "indirizzo": "Cavaso del Tomba"},
    {"zona": 2, "comune": "Paderno del Grappa", "nome": "Istituti Filippin", "indirizzo": "Via Cardinal la Fontaine, 2, Paderno del Grappa"},
    {"zona": 2, "comune": "Pederobba", "nome": "Fisico Fitness Club", "indirizzo": "Pederobba"},
    {"zona": 2, "comune": "Segusino", "nome": "CIDI", "indirizzo": "Via Della Centa, 3, Segusino"},
    {"zona": 2, "comune": "Monfumo", "nome": "Palestra Comunale", "indirizzo": "Monfumo"},
    {"zona": 2, "comune": "Possagno", "nome": "Palestra Comunale", "indirizzo": "Via degli Impianti Sportivi, 7, Possagno"},
    {"zona": 2, "comune": "Crespano del Grappa", "nome": "Challenge Fit Center", "indirizzo": "Via Papa Giovanni XXIII, 18, Crespano del Grappa"},
    {"zona": 2, "comune": "Crespano del Grappa", "nome": "Alpha AP Fitness", "indirizzo": "Via Asolana, 29/A, Crespano del Grappa"},
    {"zona": 2, "comune": "Trevignano", "nome": "Fitness Faktory", "indirizzo": "Trevignano"},
    {"zona": 2, "comune": "Trevignano", "nome": "Palestra Comunale", "indirizzo": "Trevignano"},
    
    # ZONA 3 - Castelfranco Veneto e Marca Occidentale
    {"zona": 3, "comune": "Castelfranco Veneto", "nome": "FitUP Castelfranco Veneto", "indirizzo": "Via dei Tigli, 25/A, Castelfranco Veneto"},
    {"zona": 3, "comune": "Castelfranco Veneto", "nome": "Happy Fit Castelfranco", "indirizzo": "Via delle Industrie, 18, Castelfranco Veneto"},
    {"zona": 3, "comune": "Castelfranco Veneto", "nome": "DG Club Castelfranco", "indirizzo": "Via dei Tigli, 30, Castelfranco Veneto"},
    {"zona": 3, "comune": "Castelfranco Veneto", "nome": "Kinesis Palestra", "indirizzo": "Via dei Tigli, 15/A, Castelfranco Veneto"},
    {"zona": 3, "comune": "Castelfranco Veneto", "nome": "Centro Sportivo San Giacomo", "indirizzo": "Via San Giacomo, 10, Castelfranco Veneto"},
    {"zona": 3, "comune": "Resana", "nome": "Happy Fit Resana", "indirizzo": "Via dell'Industria, 12, Resana"},
    {"zona": 3, "comune": "Resana", "nome": "Palestra Comunale", "indirizzo": "Via Roma, 45, Resana"},
    {"zona": 3, "comune": "Castello di Godego", "nome": "Palestra Comunale", "indirizzo": "Via degli Sportivi, 8, Castello di Godego"},
    {"zona": 3, "comune": "Loria", "nome": "Happy Fit Loria", "indirizzo": "Via dell'Artigianato, 7, Loria"},
    {"zona": 3, "comune": "Loria", "nome": "ASD Polisportiva Loria", "indirizzo": "Via dello Sport, 3, Loria"},
    {"zona": 3, "comune": "Riese Pio X", "nome": "Palestra Comunale", "indirizzo": "Via degli Impianti, 5, Riese Pio X"},
    {"zona": 3, "comune": "Riese Pio X", "nome": "ASD Ginnastica Riese", "indirizzo": "Riese Pio X"},
    {"zona": 3, "comune": "Vedelago", "nome": "Happy Fit Vedelago", "indirizzo": "Via dell'Industria, 22, Vedelago"},
    {"zona": 3, "comune": "Vedelago", "nome": "Palestra Comunale", "indirizzo": "Via Roma, 78, Vedelago"},
    {"zona": 3, "comune": "Maserada sul Piave", "nome": "Happy Fit Maserada", "indirizzo": "Via dell'Industria, 15, Maserada sul Piave"},
    {"zona": 3, "comune": "Maserada sul Piave", "nome": "Palestra Comunale", "indirizzo": "Via dello Sport, 12, Maserada sul Piave"},
    {"zona": 3, "comune": "Breda di Piave", "nome": "Palestra Comunale", "indirizzo": "Via degli Sportivi, 20, Breda di Piave"},
    {"zona": 3, "comune": "Breda di Piave", "nome": "ASD Polisportiva Breda", "indirizzo": "Breda di Piave"},
    {"zona": 3, "comune": "San Zenone degli Ezzelini", "nome": "Palestra Comunale", "indirizzo": "Via degli Impianti, 3, San Zenone degli Ezzelini"},
    {"zona": 3, "comune": "San Zenone degli Ezzelini", "nome": "ASD Polisportiva San Zenone", "indirizzo": "San Zenone degli Ezzelini"},
    
    # ZONA 4 - Alta Marca, Colline del Prosecco e Nord
    {"zona": 4, "comune": "Valdobbiadene", "nome": "Palestra Comunale", "indirizzo": "Via degli Impianti, 4, Valdobbiadene"},
    {"zona": 4, "comune": "Valdobbiadene", "nome": "ASD Polisportiva Valdobbiadene", "indirizzo": "Valdobbiadene"},
    {"zona": 4, "comune": "Vidor", "nome": "Palestra Comunale", "indirizzo": "Via Roma, 25, Vidor"},
    {"zona": 4, "comune": "Vidor", "nome": "ASD Polisportiva Vidor", "indirizzo": "Vidor"},
    {"zona": 4, "comune": "Miane", "nome": "Palestra Comunale", "indirizzo": "Via degli Sportivi, 8, Miane"},
    {"zona": 4, "comune": "Miane", "nome": "ASD Polisportiva Miane", "indirizzo": "Miane"},
    {"zona": 4, "comune": "Follina", "nome": "Palestra Comunale", "indirizzo": "Via degli Impianti, 2, Follina"},
    {"zona": 4, "comune": "Follina", "nome": "ASD Polisportiva Follina", "indirizzo": "Follina"},
    {"zona": 4, "comune": "Cison di Valmarino", "nome": "Palestra Comunale", "indirizzo": "Via Roma, 15, Cison di Valmarino"},
    {"zona": 4, "comune": "Cison di Valmarino", "nome": "ASD Polisportiva Cison", "indirizzo": "Cison di Valmarino"},
    {"zona": 4, "comune": "Refrontolo", "nome": "Palestra Comunale", "indirizzo": "Via degli Sportivi, 5, Refrontolo"},
    {"zona": 4, "comune": "Refrontolo", "nome": "ASD Polisportiva Refrontolo", "indirizzo": "Refrontolo"},
    {"zona": 4, "comune": "Pieve di Soligo", "nome": "Palestra Comunale", "indirizzo": "Via degli Impianti, 10, Pieve di Soligo"},
    {"zona": 4, "comune": "Pieve di Soligo", "nome": "ASD Polisportiva Pieve di Soligo", "indirizzo": "Pieve di Soligo"},
    {"zona": 4, "comune": "Farra di Soligo", "nome": "Palestra Comunale", "indirizzo": "Via Roma, 30, Farra di Soligo"},
    {"zona": 4, "comune": "Farra di Soligo", "nome": "ASD Polisportiva Farra", "indirizzo": "Farra di Soligo"},
    {"zona": 4, "comune": "San Pietro di Feletto", "nome": "Palestra Comunale", "indirizzo": "Via degli Sportivi, 12, San Pietro di Feletto"},
    {"zona": 4, "comune": "San Pietro di Feletto", "nome": "ASD Polisportiva San Pietro", "indirizzo": "San Pietro di Feletto"},
    {"zona": 4, "comune": "Susegana", "nome": "Palestra Comunale", "indirizzo": "Via degli Impianti, 6, Susegana"},
    {"zona": 4, "comune": "Susegana", "nome": "ASD Polisportiva Susegana", "indirizzo": "Susegana"},
    {"zona": 4, "comune": "Moriago della Battaglia", "nome": "Palestra Comunale", "indirizzo": "Via Roma, 18, Moriago della Battaglia"},
    {"zona": 4, "comune": "Moriago della Battaglia", "nome": "ASD Polisportiva Moriago", "indirizzo": "Moriago della Battaglia"},
    {"zona": 4, "comune": "Sernaglia della Battaglia", "nome": "Palestra Comunale", "indirizzo": "Via degli Sportivi, 9, Sernaglia della Battaglia"},
    {"zona": 4, "comune": "Sernaglia della Battaglia", "nome": "ASD Polisportiva Sernaglia", "indirizzo": "Sernaglia della Battaglia"},
    
    # ZONA 5 - Coneglianese e Vittoriese
    {"zona": 5, "comune": "Conegliano", "nome": "FitActive Conegliano", "indirizzo": "Conegliano"},
    {"zona": 5, "comune": "Conegliano", "nome": "Studio Talea", "indirizzo": "Conegliano"},
    {"zona": 5, "comune": "Conegliano", "nome": "Medicenter Conegliano", "indirizzo": "Viale Italia, 290, Conegliano"},
    {"zona": 5, "comune": "Conegliano", "nome": "Puro Fitness", "indirizzo": "Conegliano"},
    {"zona": 5, "comune": "Conegliano", "nome": "Palestra Stadio", "indirizzo": "Conegliano"},
    {"zona": 5, "comune": "Conegliano", "nome": "Sportway", "indirizzo": "Via Feltrina Sud, 189, Conegliano"},
    {"zona": 5, "comune": "Vittorio Veneto", "nome": "Flow Palestra", "indirizzo": "Via Carlo Torres, 17/5, Vittorio Veneto"},
    {"zona": 5, "comune": "Vittorio Veneto", "nome": "Round1", "indirizzo": "Vittorio Veneto"},
    {"zona": 5, "comune": "Vittorio Veneto", "nome": "Bobadilla Vittorio Veneto", "indirizzo": "Vittorio Veneto"},
    {"zona": 5, "comune": "Vittorio Veneto", "nome": "Body Evidence Vittorio Veneto", "indirizzo": "Via Menarè, 304/A, Vittorio Veneto"},
    {"zona": 5, "comune": "Vittorio Veneto", "nome": "Palestra Beltrame-Flaminio", "indirizzo": "Vittorio Veneto"},
    {"zona": 5, "comune": "San Vendemiano", "nome": "WebFit", "indirizzo": "Via Resistenza, 2, San Vendemiano"},
    {"zona": 5, "comune": "San Vendemiano", "nome": "Joy Club", "indirizzo": "Via Italia, San Vendemiano"},
    {"zona": 5, "comune": "San Vendemiano", "nome": "NEWFIT San Vendemiano", "indirizzo": "Via Resistenza, 2/f, San Vendemiano"},
    {"zona": 5, "comune": "San Vendemiano", "nome": "ASD Royal Ginnastica", "indirizzo": "San Vendemiano"},
    {"zona": 5, "comune": "Colle Umberto", "nome": "Energy Fitness ASD", "indirizzo": "Viale dell'Artigianato, 12, Colle Umberto"},
    {"zona": 5, "comune": "Colle Umberto", "nome": "Palestra Olimpia ASD", "indirizzo": "Via Vittorio Veneto, 12, Colle Umberto"},
    {"zona": 5, "comune": "Colle Umberto", "nome": "Palestra Comunale", "indirizzo": "Via Garibaldi, 6, Colle Umberto"},
    {"zona": 5, "comune": "Cordignano", "nome": "i GO Club Cordignano", "indirizzo": "Cordignano"},
    {"zona": 5, "comune": "Cordignano", "nome": "Palestra Scuole Medie", "indirizzo": "Via Gazzari, 1, Cordignano"},
    {"zona": 5, "comune": "Cordignano", "nome": "Team Corifeo", "indirizzo": "Cordignano"},
    {"zona": 5, "comune": "Godega di Sant'Urbano", "nome": "i GO Club Pianzano", "indirizzo": "Via S. Urbano, 45, Pianzano di Godega"},
    {"zona": 5, "comune": "Godega di Sant'Urbano", "nome": "PalaGodega", "indirizzo": "Via della Liberazione, 21, Godega di Sant'Urbano"},
    {"zona": 5, "comune": "Orsago", "nome": "Palestra Comunale", "indirizzo": "Via Borgo Basso, 22, Orsago"},
    {"zona": 5, "comune": "Orsago", "nome": "ASD KUMA", "indirizzo": "Orsago"},
    {"zona": 5, "comune": "Tarzo", "nome": "Palestra Comunale", "indirizzo": "Tarzo"},
    {"zona": 5, "comune": "Tarzo", "nome": "Orienteering Tarzo ASD", "indirizzo": "Via Cesare Battisti, 12, Tarzo"},
    {"zona": 5, "comune": "Revine Lago", "nome": "Palestra Comunale", "indirizzo": "Revine Lago"},
    {"zona": 5, "comune": "Fregona", "nome": "Palestra Comunale", "indirizzo": "Fregona"},
    {"zona": 5, "comune": "Fregona", "nome": "Astra C5", "indirizzo": "Fregona"},
    {"zona": 5, "comune": "Sarmede", "nome": "Palestra Comunale", "indirizzo": "Via Sandro Pertini, 2, Sarmede"},
    {"zona": 5, "comune": "Sarmede", "nome": "Elite Fitness Club", "indirizzo": "Sarmede"},
    {"zona": 5, "comune": "Sarmede", "nome": "Time For Dancing", "indirizzo": "Sarmede"},
    {"zona": 5, "comune": "Cappella Maggiore", "nome": "Palestra Scuole Medie", "indirizzo": "Via Livel, Cappella Maggiore"},
    {"zona": 5, "comune": "Cappella Maggiore", "nome": "Palestra Digitale", "indirizzo": "Via Livel 101, Cappella Maggiore"},
    {"zona": 5, "comune": "Santa Lucia di Piave", "nome": "ASD Fit Your Fun", "indirizzo": "Via Mareno, 34, Santa Lucia di Piave"},
    {"zona": 5, "comune": "Santa Lucia di Piave", "nome": "Palestra Comunale", "indirizzo": "Santa Lucia di Piave"},
    {"zona": 5, "comune": "San Fior", "nome": "Palestra Arcostruttura", "indirizzo": "Via I. Mel, 6, San Fior"},
    {"zona": 5, "comune": "San Fior", "nome": "Palestra Digitale", "indirizzo": "San Fior"},
    {"zona": 5, "comune": "Codognè", "nome": "Area 4 Fitness", "indirizzo": "Codognè"},
    {"zona": 5, "comune": "Codognè", "nome": "Palablu", "indirizzo": "Codognè"},
    {"zona": 5, "comune": "Mareno di Piave", "nome": "Palestra In.Forma", "indirizzo": "Via Verri, 79, Mareno di Piave"},
    {"zona": 5, "comune": "Mareno di Piave", "nome": "Polisportiva Comunale", "indirizzo": "Mareno di Piave"},
    {"zona": 5, "comune": "Vazzola", "nome": "Palestra In.Forma", "indirizzo": "Vazzola"},
    {"zona": 5, "comune": "Cimadolmo", "nome": "Palestra Comunale", "indirizzo": "Via Giovanni Battista Lovadina, Cimadolmo"},
    {"zona": 5, "comune": "Cimadolmo", "nome": "ASD Black Sheep", "indirizzo": "Cimadolmo"},
    {"zona": 5, "comune": "Povegliano", "nome": "Palestra Fit POINT", "indirizzo": "Via Prato della Valle, 10, Povegliano"},
    {"zona": 5, "comune": "Povegliano", "nome": "Palestra Scuole Medie", "indirizzo": "Povegliano"},
    
    # ZONA 6 - Destra Piave, Opitergina e Bassa Orientale
    {"zona": 6, "comune": "Oderzo", "nome": "FirstFit Oderzo", "indirizzo": "Oderzo"},
    {"zona": 6, "comune": "Oderzo", "nome": "Bewellness Oderzo", "indirizzo": "Oderzo"},
    {"zona": 6, "comune": "Oderzo", "nome": "Brandolini Sport", "indirizzo": "Oderzo"},
    {"zona": 6, "comune": "Oderzo", "nome": "Sun Fit Oderzo", "indirizzo": "Oderzo"},
    {"zona": 6, "comune": "Oderzo", "nome": "Palestra Club Delfino", "indirizzo": "Oderzo"},
    {"zona": 6, "comune": "Oderzo", "nome": "Gymnos", "indirizzo": "Oderzo"},
    {"zona": 6, "comune": "Oderzo", "nome": "Athletic Gym", "indirizzo": "Oderzo"},
    {"zona": 6, "comune": "Oderzo", "nome": "Olympia Fit", "indirizzo": "Oderzo"},
    {"zona": 6, "comune": "Motta di Livenza", "nome": "Body & Mind Evolution", "indirizzo": "Motta di Livenza"},
    {"zona": 6, "comune": "Motta di Livenza", "nome": "Gymnasium Piscine", "indirizzo": "Via Friuli, 42/B, Motta di Livenza"},
    {"zona": 6, "comune": "Motta di Livenza", "nome": "Laboratorio del Movimento", "indirizzo": "Via Cattaneo, 1, Motta di Livenza"},
    {"zona": 6, "comune": "Motta di Livenza", "nome": "Centro Danza & Movimento", "indirizzo": "Motta di Livenza"},
    {"zona": 6, "comune": "Ponte di Piave", "nome": "Active Ponte ASD", "indirizzo": "Piazza Walter Tobagi, Ponte di Piave"},
    {"zona": 6, "comune": "Ponte di Piave", "nome": "Lime Fitness House", "indirizzo": "Via dell'Artigianato, 13, Ponte di Piave"},
    {"zona": 6, "comune": "San Biagio di Callalta", "nome": "Palestra Comunale", "indirizzo": "San Biagio di Callalta"},
    {"zona": 6, "comune": "Gorgo al Monticano", "nome": "Body Up", "indirizzo": "Via Monticano, 3, Gorgo al Monticano"},
    {"zona": 6, "comune": "Gorgo al Monticano", "nome": "ASD New Body Up", "indirizzo": "Via Monticano, 3, Gorgo al Monticano"},
    {"zona": 6, "comune": "Mansuè", "nome": "Palestra Comunale", "indirizzo": "Mansuè"},
    {"zona": 6, "comune": "Fontanelle", "nome": "Campo Sportivo Fontanelle", "indirizzo": "Via Papa Giovanni XXIII, Fontanelle"},
    {"zona": 6, "comune": "Ormelle", "nome": "Audaxe Fitness Tribe", "indirizzo": "Ormelle"},
    {"zona": 6, "comune": "Ormelle", "nome": "Le Pleiadi Club", "indirizzo": "Ormelle"},
    {"zona": 6, "comune": "Salgareda", "nome": "Palestra Scuola Media", "indirizzo": "Salgareda"},
    {"zona": 6, "comune": "Zenson di Piave", "nome": "Palestra Comunale", "indirizzo": "Zenson di Piave"},
    {"zona": 6, "comune": "Zenson di Piave", "nome": "Am Personal Project", "indirizzo": "Zenson di Piave"},
    {"zona": 6, "comune": "Chiarano", "nome": "Palestra Comunale", "indirizzo": "Chiarano"},
    {"zona": 6, "comune": "Cessalto", "nome": "Campo Sportivo", "indirizzo": "Via Armando Diaz, 31, Cessalto"},
    {"zona": 6, "comune": "Cessalto", "nome": "Palazzetto dello Sport", "indirizzo": "Via Luigi Einaudi, 9, Cessalto"},
    {"zona": 6, "comune": "Cessalto", "nome": "Body & Mind S.r.l.", "indirizzo": "Cessalto"},
    {"zona": 6, "comune": "Meduna di Livenza", "nome": "Palestra Comunale", "indirizzo": "Meduna di Livenza"},
    {"zona": 6, "comune": "Meduna di Livenza", "nome": "Energym", "indirizzo": "Meduna di Livenza"},
    {"zona": 6, "comune": "Gaiarine", "nome": "Solerò Sport Village", "indirizzo": "Gaiarine"},
    {"zona": 6, "comune": "Gaiarine", "nome": "Energy Fitness A.S.D.", "indirizzo": "Gaiarine"},
    {"zona": 6, "comune": "Gaiarine", "nome": "Athletic Fitness Center", "indirizzo": "Gaiarine"},
    {"zona": 6, "comune": "Portobuffolé", "nome": "Campo Sportivo", "indirizzo": "Portobuffolé"},
    {"zona": 6, "comune": "Portobuffolé", "nome": "Funnycenter Academy SSD", "indirizzo": "Portobuffolé"},
    {"zona": 6, "comune": "San Polo di Piave", "nome": "Energy Salus", "indirizzo": "Via del Commercio, 24, San Polo di Piave"},
    {"zona": 6, "comune": "San Polo di Piave", "nome": "Puro Fitness San Polo", "indirizzo": "San Polo di Piave"},
    {"zona": 6, "comune": "San Polo di Piave", "nome": "Palazzetto Polifunzionale", "indirizzo": "San Polo di Piave"},
]

def geolocalizza_indirizzo(indirizzo):
    """Geolocalizza un indirizzo usando Nominatim (OpenStreetMap)"""
    url = f"https://nominatim.openstreetmap.org/search?format=json&q={quote(indirizzo)}&limit=1"
    headers = {
        'User-Agent': 'PalestreTrevisoBot/1.0 (tuo-email@esempio.com)'
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        if data and len(data) > 0:
            return {
                'lat': float(data[0]['lat']),
                'lon': float(data[0]['lon']),
                'display_name': data[0]['display_name']
            }
        else:
            return None
    except Exception as e:
        print(f"Errore durante la geolocalizzazione di '{indirizzo}': {e}")
        return None

def main():
    print("Inizio geolocalizzazione di TUTTE le palestre della provincia di Treviso...")
    print(f"Totale palestre da processare: {len(palestre)}")
    print("-" * 80)
    
    risultati = []
    errori = []
    
    for i, palestra in enumerate(palestre, 1):
        print(f"[{i}/{len(palestre)}] Geolocalizzazione: {palestra['nome']} - {palestra['indirizzo']}")
        
        coords = geolocalizza_indirizzo(palestra['indirizzo'])
        
        if coords:
            risultati.append({
                'Zona': palestra['zona'],
                'Comune': palestra['comune'],
                'Nome Palestra': palestra['nome'],
                'Indirizzo': palestra['indirizzo'],
                'Latitudine': coords['lat'],
                'Longitudine': coords['lon'],
                'Indirizzo Completo': coords['display_name'],
                'Stato': 'OK'
            })
            print(f"  ✓ Trovato: {coords['lat']}, {coords['lon']}")
        else:
            risultati.append({
                'Zona': palestra['zona'],
                'Comune': palestra['comune'],
                'Nome Palestra': palestra['nome'],
                'Indirizzo': palestra['indirizzo'],
                'Latitudine': '',
                'Longitudine': '',
                'Indirizzo Completo': '',
                'Stato': 'NON TROVATO'
            })
            errori.append(palestra)
            print(f"  ✗ Non trovato")
        
        # Rispetta il rate limit di Nominatim (1 richiesta al secondo)
        time.sleep(1.1)
    
    # Salva i risultati in CSV
    nome_file = 'palestre_treviso_COMPLETE_geolocalizzate.csv'
    with open(nome_file, 'w', newline='', encoding='utf-8') as csvfile:
        fieldnames = ['Zona', 'Comune', 'Nome Palestra', 'Indirizzo', 'Latitudine', 'Longitudine', 'Indirizzo Completo', 'Stato']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        
        writer.writeheader()
        writer.writerows(risultati)
    
    print("\n" + "=" * 80)
    print(f"✓ Completato! File salvato: {nome_file}")
    print(f"✓ Totale palestre processate: {len(palestre)}")
    print(f"✓ Geolocalizzate con successo: {len(risultati) - len(errori)}")
    print(f"✗ Non trovate: {len(errori)}")
    
    if errori:
        print("\nPalestre non trovate (da verificare manualmente):")
        for err in errori:
            print(f"  - {err['nome']} ({err['indirizzo']})")

if __name__ == "__main__":
    main()