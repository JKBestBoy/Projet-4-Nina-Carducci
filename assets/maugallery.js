// Définition du plugin jQuery "mauGallery" sur l'objet jQuery avec des méthodes pour créer un wrapper de ligne (grid), une lightbox (modale), et des listeners pour la galerie d'images.
(function($) {
  $.fn.mauGallery = function(options) {
    // Fusion des options par défaut du plugin avec celles fournies par l'utilisateur.
    var options = $.extend($.fn.mauGallery.defaults, options);
    var tagsCollection = []; // Collection pour stocker les tags uniques.

    // Application du plugin à chaque élément sélectionné.
    return this.each(function() {
      // Initialisation de la galerie : création de la structure, lightbox et écouteurs d'événements.
      $.fn.mauGallery.methods.createRowWrapper($(this)); // Crée un wrapper pour les éléments de la galerie.
      if (options.lightBox) {
        // Si l'option lightBox est activée, initialise la lightbox.
        $.fn.mauGallery.methods.createLightBox(
          $(this),
          options.lightboxId,
          options.navigation
        );
      }
      $.fn.mauGallery.listeners(options); // Initialise les écouteurs d'événements.
      
      // Traitement de chaque item de la galerie.
      $(this)
        .children(".gallery-item")
        .each(function(index) {
          // Applique des ajustements pour la responsivité et le placement des items.
          $.fn.mauGallery.methods.responsiveImageItem($(this));
          $.fn.mauGallery.methods.moveItemInRowWrapper($(this));
          $.fn.mauGallery.methods.wrapItemInColumn($(this), options.columns);

          // Gestion des tags pour le filtrage des items.
          var theTag = $(this).data("gallery-tag");
          if (
            options.showTags &&
            theTag !== undefined &&
            tagsCollection.indexOf(theTag) === -1
          ) {
            tagsCollection.push(theTag); // Ajoute le tag à la collection s'il est unique.
          }
        });

      // Affichage des tags pour le filtrage si l'option est activée.
      if (options.showTags) {
        $.fn.mauGallery.methods.showItemTags(
          $(this),
          options.tagsPosition,
          tagsCollection
        );
      }

      $(this).fadeIn(500); // Effet de fondu pour l'apparition de la galerie.
    });
  };

  // Options par défaut du plugin.
  $.fn.mauGallery.defaults = {
    columns: 3,
    lightBox: true,
    lightboxId: null,
    showTags: true,
    tagsPosition: "bottom",
    navigation: true
  };

  // Fonctions utilitaires et gestionnaires d'événements du plugin.
  $.fn.mauGallery.listeners = function(options) {
    // Gestionnaire d'événements pour les clics sur les items de la galerie.
    $(".gallery-item").on("click", function() {
      // Ouvre la lightbox si l'option est activée et si l'élément cliqué est une image.
      if (options.lightBox && $(this).prop("tagName") === "IMG") {
        $.fn.mauGallery.methods.openLightBox($(this), options.lightboxId);
      } else {
        return;
      }
    });

    // Gestionnaire d'événements pour le filtrage par tags.
    $(".gallery").on("click", ".nav-link", $.fn.mauGallery.methods.filterByTag);

    // Gestionnaires d'événements pour naviguer entre les images dans la lightbox.
    $(".gallery").on("click", ".mg-prev", () =>
      $.fn.mauGallery.methods.prevImage(options.lightboxId)
    );
    $(".gallery").on("click", ".mg-next", () =>
      $.fn.mauGallery.methods.nextImage(options.lightboxId)
    );
  };

  $.fn.mauGallery.methods = {
  // Crée un wrapper '.gallery-items-row' si celui-ci n'existe pas déjà.
    createRowWrapper(element) {
      if (
        !element
          .children()
          .first()
          .hasClass("row")
      ) {
        element.append('<div class="gallery-items-row row"></div>');
      }
    },
    // Enveloppe les items de la galerie dans des colonnes en fonction du nombre de colonnes spécifié.
    wrapItemInColumn(element, columns) {
      // Logique pour déterminer les classes de colonne en fonction du nombre spécifié.
      if (columns.constructor === Number) {
        element.wrap(
          `<div class='item-column mb-4 col-${Math.ceil(12 / columns)}'></div>`
        );
      } else if (columns.constructor === Object) {
        var columnClasses = "";
        if (columns.xs) {
          columnClasses += ` col-${Math.ceil(12 / columns.xs)}`;
        }
        if (columns.sm) {
          columnClasses += ` col-sm-${Math.ceil(12 / columns.sm)}`;
        }
        if (columns.md) {
          columnClasses += ` col-md-${Math.ceil(12 / columns.md)}`;
        }
        if (columns.lg) {
          columnClasses += ` col-lg-${Math.ceil(12 / columns.lg)}`;
        }
        if (columns.xl) {
          columnClasses += ` col-xl-${Math.ceil(12 / columns.xl)}`;
        }
        element.wrap(`<div class='item-column mb-4${columnClasses}'></div>`);
      } else {
        console.error(
          `Columns should be defined as numbers or objects. ${typeof columns} is not supported.`
        );
      }
    },
    // Déplace les items de la galerie dans le wrapper '.gallery-items-row'.
    moveItemInRowWrapper(element) {
      element.appendTo(".gallery-items-row");
    },
    // Ajoute la classe 'img-fluid' aux images pour les rendre responsives.
    responsiveImageItem(element) {
      if (element.prop("tagName") === "IMG") {
        element.addClass("img-fluid");
      }
    },
    // Ouvre la lightbox et affiche l'image sélectionnée.
    openLightBox(element, lightboxId) {
      $(`#${lightboxId}`)
        .find(".lightboxImage")
        .attr("src", element.attr("src"));
      $(`#${lightboxId}`).modal("toggle");
    },
    // Logique pour naviguer à l'image précédente dans la lightbox.
    prevImage() {
      // Trouve l'image active, détermine l'image précédente et la montre.
      let activeImage = null;
      $("img.gallery-item").each(function() {
        if ($(this).attr("src") === $(".lightboxImage").attr("src")) {
          activeImage = $(this);
        }
      });
      let activeTag = $(".tags-bar span.active-tag").data("images-toggle");
      let imagesCollection = [];
      if (activeTag === "all") {
        $(".item-column").each(function() {
          if ($(this).children("img").length) {
            imagesCollection.push($(this).children("img"));
          }
        });
      } else {
        $(".item-column").each(function() {
          if (
            $(this)
              .children("img")
              .data("gallery-tag") === activeTag
          ) {
            imagesCollection.push($(this).children("img"));
          }
        });
      }
      let index = 0,
        next = null;

      $(imagesCollection).each(function(i) {
        if ($(activeImage).attr("src") === $(this).attr("src")) {
          index = i ;
        }
      });
      next =
        imagesCollection[index] ||
        imagesCollection[imagesCollection.length - 1];
      $(".lightboxImage").attr("src", $(next).attr("src"));
    },
    // Logique pour naviguer à l'image suivante dans la lightbox.
    nextImage() {
      // Trouve l'image active, détermine l'image suivante et la montre.
      let activeImage = null;
      $("img.gallery-item").each(function() {
        if ($(this).attr("src") === $(".lightboxImage").attr("src")) {
          activeImage = $(this);
        }
      });
      let activeTag = $(".tags-bar span.active-tag").data("images-toggle");
      let imagesCollection = [];
      if (activeTag === "all") {
        $(".item-column").each(function() {
          if ($(this).children("img").length) {
            imagesCollection.push($(this).children("img"));
          }
        });
      } else {
        $(".item-column").each(function() {
          if (
            $(this)
              .children("img")
              .data("gallery-tag") === activeTag
          ) {
            imagesCollection.push($(this).children("img"));
          }
        });
      }
      let index = 0,
        next = null;

      $(imagesCollection).each(function(i) {
        if ($(activeImage).attr("src") === $(this).attr("src")) {
          index = i;
        }
      });
      next = imagesCollection[index] || imagesCollection[0];
      $(".lightboxImage").attr("src", $(next).attr("src"));
    },
    // Crée la lightbox si l'option lightBox est activée.
    createLightBox(gallery, lightboxId, navigation) {
      // Construction de la structure HTML de la lightbox et insertion dans le DOM.
      gallery.append(`<div class="modal fade" id="${
        lightboxId ? lightboxId : "galleryLightbox"
      }" tabindex="-1" role="dialog" aria-hidden="true">
                <div class="modal-dialog" role="document">
                    <div class="modal-content">
                        <div class="modal-body">
                            ${
                              navigation
                                ? '<div class="mg-prev" style="cursor:pointer;position:absolute;top:50%;left:-15px;background:white;"><</div>'
                                : '<span style="display:none;" />'
                            }
                            <img class="lightboxImage img-fluid" alt="Contenu de l'image affichée dans la modale au clique"/>
                            ${
                              navigation
                                ? '<div class="mg-next" style="cursor:pointer;position:absolute;top:50%;right:-15px;background:white;}">></div>'
                                : '<span style="display:none;" />'
                            }
                        </div>
                    </div>
                </div>
            </div>`);
    },
    // Affiche les tags pour le filtrage des items de la galerie si l'option showTags est activée.
    showItemTags(gallery, position, tags) {
      // Construction des éléments de tags et insertion dans le DOM à la position spécifiée.
      var tagItems =
        '<li class="nav-item"><span class="nav-link active active-tag"  data-images-toggle="all">Tous</span></li>';
      $.each(tags, function(index, value) {
        tagItems += `<li class="nav-item active">
                <span class="nav-link"  data-images-toggle="${value}">${value}</span></li>`;
      });
      var tagsRow = `<ul class="my-4 tags-bar nav nav-pills">${tagItems}</ul>`;

      if (position === "bottom") {
        gallery.append(tagsRow);
      } else if (position === "top") {
        gallery.prepend(tagsRow);
      } else {
        console.error(`Unknown tags position: ${position}`);
      }
    },
    // Filtrage des items de la galerie en fonction du tag sélectionné.
    filterByTag() {
      // Logique pour cacher/montrer les items de la galerie en fonction du tag.
      if ($(this).hasClass("active-tag")) {
        return;
      }
      $(".active-tag").removeClass("active active-tag");
      $(this).addClass("active-tag");

      var tag = $(this).data("images-toggle");

      $(".gallery-item").each(function() {
        $(this)
          .parents(".item-column")
          .hide();
        if (tag === "all") {
          $(this)
            .parents(".item-column")
            .show(300);
        } else if ($(this).data("gallery-tag") === tag) {
          $(this)
            .parents(".item-column")
            .show(300);
        }
      });
    }
  };
})(jQuery);
