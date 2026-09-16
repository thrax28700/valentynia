-- Renomme la valeur d'enum "PREMIUM" en "SUR_MESURE" (on évite le mot "premium" dans le produit)
ALTER TYPE "Plan" RENAME VALUE 'PREMIUM' TO 'SUR_MESURE';
