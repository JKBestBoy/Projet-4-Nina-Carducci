$(document).ready(function() {
    $('.gallery').mauGallery({
        columns: {
            xs: 1, // 1 colonne pour les très petits écrans.
            sm: 2, // 2 colonnes pour les petits écrans.
            md: 3, // 3 colonnes pour les écrans moyens à larges.
            lg: 3,
            xl: 3
        },
        lightBox: true, // Active la fonctionnalité de lightbox.
        lightboxId: 'myAwesomeLightbox', // Identifiant personnalisé pour la lightbox.
        showTags: true, // Active l'affichage des tags pour le filtrage.
        tagsPosition: 'top' // Place les tags au-dessus de la galerie.
    });
});
