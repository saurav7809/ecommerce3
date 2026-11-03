package com.homenest.config;

import com.homenest.catalog.Category;
import com.homenest.catalog.CategoryRepository;
import com.homenest.catalog.Product;
import com.homenest.catalog.ProductRepository;
import com.homenest.common.Slugs;
import com.homenest.review.Review;
import com.homenest.review.ReviewRepository;
import com.homenest.search.ProductSearchIndex;
import com.homenest.user.Role;
import com.homenest.user.User;
import com.homenest.user.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

/**
 * Seeds a demo home-furnishings catalog, demo accounts and reviews on the first start with an empty database.
 * Disable with SEED_DATA=false.
 */
@Component
public class DataSeeder implements ApplicationRunner {
    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private static String img(String id) {
        return "https://images.unsplash.com/photo-" + id + "?auto=format&fit=crop&w=1200&q=80";
    }

    private record Dept(String slug, String name, String description, String image, List<Sub> subs) { }
    private record Sub(String slug, String name, String image) { }

    private record P(String name, String brand, String sub, String room, String style, String color, String material,
                     int price, Integer was, int stock, double[] size, double kg, boolean assembly, boolean freeShip,
                     boolean featured, String blurb, String... images) { }

    private static double[] cm(double w, double d, double h) { return new double[]{w, d, h}; }

    private static final List<Dept> DEPARTMENTS = List.of(
            new Dept("furniture", "Furniture", "Sofas, beds, dining and everything in between", img("1616486338812-3dadae4b4ace"), List.of(
                    new Sub("sofas", "Sofas & Sectionals", img("1555041469-a586c61ea9bc")),
                    new Sub("accent-chairs", "Accent Chairs", img("1586023492125-27b2c045efd7")),
                    new Sub("coffee-tables", "Coffee & Side Tables", img("1532372320572-cda25653a26d")),
                    new Sub("beds", "Beds & Headboards", img("1505693416388-ac5ce068fe85")),
                    new Sub("dining-sets", "Dining Tables & Sets", img("1617806118233-18e1de247200")),
                    new Sub("office", "Desks & Office Chairs", img("1611269154421-4e27233ac5c7")),
                    new Sub("bookcases", "Bookcases & Cabinets", img("1594620302200-9a762244a156")))),
            new Dept("outdoor", "Outdoor", "Patio seating and outdoor dining", img("1576013551627-0cc20b96c2a7"), List.of(
                    new Sub("patio-seating", "Patio Seating", img("1576013551627-0cc20b96c2a7")),
                    new Sub("outdoor-dining", "Outdoor Dining", img("1600566753190-17f0baa2a6c3")))),
            new Dept("bedding-bath", "Bedding & Bath", "Duvets, pillows, vanities and tubs", img("1615874959474-d609969a20ed"), List.of(
                    new Sub("bedding", "Bedding & Duvets", img("1531835551805-16d864c8d311")),
                    new Sub("bed-pillows", "Bed Pillows", img("1584100936595-c0654b55a2e2")),
                    new Sub("bath", "Vanities & Bathtubs", img("1631889993959-41b4e9c6e3c5")))),
            new Dept("rugs", "Rugs", "Area rugs and runners for every floor", img("1600166898405-da9535204843"), List.of(
                    new Sub("area-rugs", "Area Rugs", img("1600121848594-d8644e57abab")),
                    new Sub("runners", "Runners & Doormats", img("1575414003591-ece8d0416c7a")))),
            new Dept("decor", "D\u00e9cor & Pillows", "Wall art, mirrors, pillows and vases", img("1618220179428-22790b461013"), List.of(
                    new Sub("wall-art", "Wall Art", img("1513519245088-0e12902e5a38")),
                    new Sub("mirrors", "Mirrors", img("1618220179428-22790b461013")),
                    new Sub("throw-pillows", "Throw Pillows", img("1579656381226-5fc0f0100c3b")),
                    new Sub("vases-candles", "Vases & Candles", img("1612196808214-b8e1d6145a8c")))),
            new Dept("lighting", "Lighting", "Floor lamps, table lamps and pendants", img("1540932239986-30128078f3c5"), List.of(
                    new Sub("floor-lamps", "Floor Lamps", img("1507473885765-e6ed057f782c")),
                    new Sub("table-lamps", "Table Lamps", img("1517991104123-1d56a6e81ed9")),
                    new Sub("pendants", "Pendants & Chandeliers", img("1513506003901-1e6a229e2d15")))),
            new Dept("kitchen", "Kitchen & Tabletop", "Cookware, dinnerware and bar stools", img("1600585152220-90363fe7e115"), List.of(
                    new Sub("cookware", "Cookware", img("1590794056226-79ef3a8147e1")),
                    new Sub("dinnerware", "Dinnerware & Serveware", img("1603199506016-b9a594b593c0")),
                    new Sub("bar-stools", "Bar & Counter Stools", img("1503602642458-232111445657")))),
            new Dept("storage", "Storage & Organization", "Baskets, wardrobes and shelving", img("1595428774223-ef52624120d2"), List.of(
                    new Sub("baskets", "Baskets & Bins", img("1590874103328-eac38a683ce7")),
                    new Sub("wardrobes", "Wardrobes & Armoires", img("1558997519-83ea9252edf8")),
                    new Sub("wall-shelves", "Wall Shelves", img("1594026112284-02bb6f3352fe")))),
            new Dept("kids-pets", "Baby, Kids & Pets", "Nursery, kids furniture and pet beds", img("1519710164239-da123dc03ef4"), List.of(
                    new Sub("kids-furniture", "Kids Furniture", img("1519710164239-da123dc03ef4")),
                    new Sub("nursery", "Nursery", img("1555252333-9f8e92e65df9")),
                    new Sub("pet-beds", "Pet Beds", img("1600369671236-e74521d4b6ad"))))
    );

    private static final List<P> PRODUCTS = List.of(
            // Sofas & Sectionals
            new P("Everly Velvet 3-Seater Sofa", "Mercer Lane", "sofas", "Living Room", "Mid-Century", "Green", "Velvet", 54999, 72999, 12, cm(213, 89, 84), 48, true, true, true,
                    "Deep emerald velvet over a kiln-dried hardwood frame, with high-resilience foam cushions and tapered walnut-finish legs.",
                    img("1555041469-a586c61ea9bc"), img("1616486338812-3dadae4b4ace")),
            new P("Hudson Top-Grain Leather Sofa", "Ashford & Co.", "sofas", "Living Room", "Modern", "Brown", "Leather", 89999, 109999, 6, cm(220, 95, 86), 62, false, true, true,
                    "Full top-grain leather that develops a rich patina, sinuous spring support and feather-wrapped seat cushions.",
                    img("1540574163026-643ea20ade25"), img("1615873968403-89e068629265")),
            new P("Juniper Tufted Sofa", "Birch Row", "sofas", "Living Room", "Traditional", "Grey", "Polyester", 42999, null, 15, cm(200, 88, 90), 45, true, true, false,
                    "Button-tufted back, rolled arms and stain-resistant performance fabric made for busy family rooms.",
                    img("1493663284031-b7e3aefcae8e"), img("1600121848594-d8644e57abab")),
            new P("Marlow Loveseat", "Nordvik", "sofas", "Living Room", "Mid-Century", "Orange", "Linen Blend", 32999, 39999, 9, cm(160, 85, 82), 34, true, true, false,
                    "A compact two-seater in burnt orange linen blend, sized for apartments and reading corners.",
                    img("1567016432779-094069958ea5")),
            new P("Coastline Sofa", "Harbor Loom", "sofas", "Living Room", "Coastal", "Blue", "Cotton", 38999, null, 11, cm(190, 90, 85), 40, true, true, false,
                    "Washable cotton slipcover in sky blue over a deep, relaxed seat.",
                    img("1484101403633-562f891dc89a"), img("1583847268964-b28dc8f51f92")),
            new P("Sunny Futon Sofa Bed", "Nordvik", "sofas", "Office", "Scandinavian", "Yellow", "Polyester", 24999, 31999, 20, cm(195, 90, 80), 38, true, false, false,
                    "Click-clack mechanism converts from sofa to guest bed in seconds.",
                    img("1558211583-d26f610c1eb1")),
            new P("Tobacco Modular Sofa", "Mercer Lane", "sofas", "Living Room", "Modern", "Brown", "Microfiber", 64999, 79999, 7, cm(240, 95, 80), 70, false, true, true,
                    "Low-slung modules you can rearrange into a sofa, chaise or corner sectional.",
                    img("1578500494198-246f612d3b3d"), img("1600210492486-724fe5c67fb0")),
            // Accent chairs
            new P("Margot Wingback Accent Chair", "Ashford & Co.", "accent-chairs", "Living Room", "Modern", "Grey", "Polyester", 14999, 18999, 25, cm(70, 75, 98), 14, true, true, false,
                    "A sculpted wingback on solid ash legs that adds height to any seating group.",
                    img("1598300042247-d088f8ab3a91")),
            new P("Saffron Lounge Armchair", "Mercer Lane", "accent-chairs", "Living Room", "Mid-Century", "Yellow", "Velvet", 18999, null, 18, cm(76, 80, 84), 16, true, true, true,
                    "Mustard velvet, a generous seat and slim brass-tipped legs.",
                    img("1586023492125-27b2c045efd7"), img("1550226891-ef816aed4a98")),
            new P("Cloud Tufted Slipper Chair", "Birch Row", "accent-chairs", "Bedroom", "Glam", "White", "Boucle", 12499, 15999, 14, cm(65, 70, 85), 11, false, true, false,
                    "Channel-tufted boucle slipper chair, perfect at a vanity or bedroom corner.",
                    img("1567538096630-e0c55bd6374c")),
            new P("Arc Molded Shell Chair", "Nordvik", "accent-chairs", "Dining Room", "Mid-Century", "White", "Polypropylene", 5499, 6999, 60, cm(62, 60, 80), 5, true, false, false,
                    "Wipe-clean molded seat on a beech dowel base. Works at the desk or dining table.",
                    img("1505843490538-5133c6c7d0e1"), img("1519947486511-46149fa0a254")),
            new P("Bistro Lounge Chair Set of 2", "Mercer Lane", "accent-chairs", "Living Room", "Industrial", "Grey", "Fabric & Steel", 21999, 26999, 10, cm(72, 74, 78), 24, true, true, false,
                    "Two cushioned lounge chairs on black steel frames for a cafe-style seating nook.",
                    img("1538688525198-9b88f6f53126")),
            // Coffee & side tables
            new P("Rowan Reclaimed Wood Coffee Table", "Oakhaven", "coffee-tables", "Living Room", "Farmhouse", "Natural", "Reclaimed Wood", 16999, 21999, 10, cm(120, 60, 45), 28, false, true, true,
                    "Each top is cut from reclaimed timber, so knots and grain make every piece one of a kind. Open shelf below.",
                    img("1532372320572-cda25653a26d")),
            new P("Pebble Round Side Table", "Nordvik", "coffee-tables", "Bedroom", "Scandinavian", "White", "Engineered Wood", 3999, null, 40, cm(40, 40, 55), 5, true, false, false,
                    "A small round table that works as a nightstand or sofa side table.",
                    img("1499933374294-4584851497cc")),
            // Beds
            new P("Ophelia Tufted Upholstered Bed", "Ashford & Co.", "beds", "Bedroom", "Traditional", "Beige", "Linen", 49999, 64999, 8, cm(165, 215, 140), 65, true, true, true,
                    "Queen bed with a diamond-tufted, scalloped headboard and solid wood slats. No box spring needed.",
                    img("1505693416388-ac5ce068fe85"), img("1540518614846-7eded433c457")),
            new P("Kai Solid Wood Platform Bed", "Oakhaven", "beds", "Bedroom", "Scandinavian", "Natural", "Solid Pine", 34999, null, 10, cm(160, 210, 35), 55, true, true, false,
                    "Low-profile platform in solid pine with a natural oil finish.",
                    img("1617325247661-675ab4b64ae2"), img("1615874959474-d609969a20ed")),
            new P("Graham Channel Headboard Bed", "Mercer Lane", "beds", "Bedroom", "Modern", "Grey", "Polyester", 41999, 52999, 9, cm(170, 215, 125), 60, true, true, false,
                    "Tall channel-stitched headboard with hotel-style proportions.",
                    img("1631049307264-da0ec9d70304")),
            new P("Noir Panel Bed", "Ashford & Co.", "beds", "Bedroom", "Industrial", "Black", "Engineered Wood", 29999, 35999, 6, cm(165, 212, 110), 58, true, true, false,
                    "Matte black panel headboard with integrated reading-light ledge.",
                    img("1566665797739-1674de7a421a")),
            // Dining
            new P("Verdant 7-Piece Dining Set", "Mercer Lane", "dining-sets", "Dining Room", "Glam", "Green", "Velvet & Marble", 79999, 99999, 4, cm(180, 90, 76), 95, true, true, true,
                    "A faux-marble table with six velvet chairs in deep green.",
                    img("1617806118233-18e1de247200")),
            new P("Sterling Live-Edge Dining Table", "Oakhaven", "dining-sets", "Dining Room", "Industrial", "Walnut", "Acacia Wood", 52999, null, 5, cm(200, 95, 76), 70, true, true, false,
                    "Solid acacia slab with a natural live edge on powder-coated steel legs. Seats eight.",
                    img("1615066390971-03e4e1c36ddf")),
            new P("Hacienda Farmhouse Dining Table", "Oakhaven", "dining-sets", "Dining Room", "Farmhouse", "Natural", "Solid Wood", 44999, 54999, 7, cm(190, 90, 76), 65, true, true, false,
                    "Plank-top farmhouse table with turned legs and a hand-rubbed finish.",
                    img("1604578762246-41134e37f9cc")),
            new P("Lumi Round Bistro Dining Set", "Nordvik", "dining-sets", "Kitchen", "Scandinavian", "White", "MDF & Beech", 19999, 24999, 12, cm(90, 90, 75), 30, true, true, false,
                    "Pedestal table with two shell chairs for breakfast nooks and small kitchens.",
                    img("1533090481720-856c6e3c1fdc")),
            // Office
            new P("Atlas Writing Desk", "Nordvik", "office", "Office", "Mid-Century", "Natural", "Oak Veneer", 15999, 19999, 22, cm(120, 60, 76), 22, true, true, true,
                    "Oak-veneer writing desk with a slim drawer and splayed solid legs.",
                    img("1611269154421-4e27233ac5c7"), img("1524758631624-e2822e304c36")),
            new P("Studio Trestle Desk", "Nordvik", "office", "Office", "Modern", "White", "Steel & MDF", 11999, null, 30, cm(140, 70, 75), 26, true, true, false,
                    "Wide work surface on adjustable trestle legs, roomy enough for two monitors.",
                    img("1518455027359-f3f8164ba6bd")),
            new P("Floating Wall Desk", "Birch Row", "office", "Office", "Minimalist", "Natural", "Solid Wood", 7999, 9999, 25, cm(100, 40, 4), 9, true, false, false,
                    "Wall-mounted solid wood desk that saves floor space in small rooms.",
                    img("1597072689227-8882273e8f6a")),
            new P("Ergo Swivel Office Chair", "Nordvik", "office", "Office", "Modern", "Grey", "Fabric", 9999, 13999, 35, cm(62, 60, 95), 12, true, false, false,
                    "Contoured seat, 360-degree swivel and gas-lift height adjustment.",
                    img("1580480055273-228ff5388ef8")),
            // Bookcases & cabinets
            new P("Library Wall Bookcase", "Oakhaven", "bookcases", "Office", "Traditional", "Natural", "Pine", 27999, 33999, 8, cm(180, 35, 210), 75, true, true, false,
                    "Floor-to-ceiling shelving with adjustable shelves and anti-tip hardware included.",
                    img("1594620302200-9a762244a156")),
            new P("Bari Open Shelf Cabinet", "Birch Row", "bookcases", "Living Room", "Scandinavian", "Natural", "Engineered Wood", 12999, null, 16, cm(80, 40, 180), 32, true, true, false,
                    "Tall cabinet that combines closed storage with open display shelves.",
                    img("1595428774223-ef52624120d2")),
            // Outdoor
            new P("Capri Poolside Lounge Set", "Sol Patio", "patio-seating", "Outdoor", "Coastal", "White", "Aluminium & Textilene", 36999, 45999, 10, cm(195, 70, 35), 22, true, true, true,
                    "Two rust-proof aluminium loungers with quick-dry textilene slings.",
                    img("1576013551627-0cc20b96c2a7")),
            new P("Courtyard Outdoor Dining Set", "Sol Patio", "outdoor-dining", "Outdoor", "Modern", "Black", "Powder-Coated Steel", 42999, 52999, 6, cm(160, 90, 74), 48, true, true, false,
                    "Weatherproof table and six stacking chairs for courtyards and terraces.",
                    img("1600566753190-17f0baa2a6c3"), img("1600585154340-be6161a56a0c")),
            // Bedding & bath
            new P("Pure Cotton Percale Duvet Set", "Harbor Loom", "bedding", "Bedroom", "Minimalist", "White", "Cotton", 4999, 6499, 80, cm(220, 240, 1), 2, false, true, true,
                    "Crisp 300-thread-count percale duvet cover with two pillow shams.",
                    img("1531835551805-16d864c8d311")),
            new P("Boho Linen Bedding Bundle", "Harbor Loom", "bedding", "Bedroom", "Bohemian", "Rust", "Linen", 7999, null, 40, cm(220, 240, 1), 3, false, true, false,
                    "Stonewashed linen duvet, fitted sheet and pillowcases in warm earth tones.",
                    img("1583845112203-29329902332e")),
            new P("Cloudrest Pillow Set of 2", "Harbor Loom", "bed-pillows", "Bedroom", "Minimalist", "White", "Microfiber", 2499, 3299, 120, cm(50, 75, 15), 2, false, false, false,
                    "Down-alternative fill with medium support for side and back sleepers.",
                    img("1584100936595-c0654b55a2e2"), img("1629949009765-40fc74c9ec21")),
            new P("Hammam Floating Bath Vanity", "Terra Kiln", "bath", "Bathroom", "Modern", "Natural", "Oak Veneer & Ceramic", 32999, 39999, 6, cm(80, 46, 50), 35, true, true, false,
                    "Wall-hung oak vanity with a ceramic basin and soft-close drawer.",
                    img("1595515106969-1ce29566ff1c")),
            new P("Aria Freestanding Bathtub", "Terra Kiln", "bath", "Bathroom", "Modern", "White", "Acrylic", 64999, 74999, 3, cm(170, 80, 60), 45, false, true, false,
                    "Double-ended acrylic soaking tub with an integrated overflow.",
                    img("1631889993959-41b4e9c6e3c5")),
            // Rugs
            new P("Isfahan Hand-Knotted Area Rug", "Harbor Loom", "area-rugs", "Living Room", "Traditional", "Beige", "Wool", 21999, 29999, 15, cm(170, 240, 1), 12, false, true, true,
                    "Hand-knotted New Zealand wool with a softly faded medallion pattern.",
                    img("1600166898405-da9535204843")),
            new P("Nordic Shag Area Rug", "Nordvik", "area-rugs", "Living Room", "Modern", "Grey", "Polypropylene", 8999, 11999, 25, cm(160, 230, 3), 8, false, true, false,
                    "Plush, shed-free pile that is easy to vacuum.",
                    img("1600121848594-d8644e57abab")),
            new P("Sunroom Jute Runner", "Harbor Loom", "runners", "Entryway", "Coastal", "Natural", "Jute", 3999, null, 30, cm(75, 240, 1), 4, false, false, false,
                    "Hand-braided jute runner for hallways, kitchens and entryways.",
                    img("1575414003591-ece8d0416c7a")),
            // Decor
            new P("Gallery Wall Frame Set", "Gallery Nine", "wall-art", "Living Room", "Eclectic", "Black", "Wood & Glass", 5999, 7999, 40, cm(150, 3, 100), 6, false, false, true,
                    "Twelve frames in mixed sizes with a paper hanging template.",
                    img("1513519245088-0e12902e5a38")),
            new P("Dutch Florals Canvas Print", "Gallery Nine", "wall-art", "Dining Room", "Traditional", "Multicolor", "Canvas", 6999, null, 20, cm(60, 3, 80), 3, false, false, false,
                    "Museum-quality giclee print of a classic still life on stretched canvas.",
                    img("1579783902614-a3fb3927b6a5")),
            new P("Coastal Sunset Framed Print", "Gallery Nine", "wall-art", "Bedroom", "Coastal", "Multicolor", "Paper", 3499, 4499, 35, cm(50, 3, 70), 2, false, false, false,
                    "Archival photographic print in a slim oak frame.",
                    img("1582053433976-25c00369fc93")),
            new P("Halo Round Wall Mirror", "Lumen House", "mirrors", "Entryway", "Glam", "Gold", "Iron & Glass", 7499, 9999, 22, cm(80, 3, 80), 7, false, true, true,
                    "Thin brushed-gold frame around a large round mirror.",
                    img("1618220179428-22790b461013")),
            new P("Tassel Throw Pillow Set", "Harbor Loom", "throw-pillows", "Living Room", "Bohemian", "Navy", "Cotton", 2999, 3999, 60, cm(45, 45, 15), 1, false, false, false,
                    "Two woven cotton covers with tassel trim and feather inserts.",
                    img("1579656381226-5fc0f0100c3b")),
            new P("Striped Lumbar Pillow Pair", "Harbor Loom", "throw-pillows", "Living Room", "Bohemian", "Brown", "Cotton", 2199, null, 50, cm(30, 50, 12), 1, false, false, false,
                    "Rust and cream stripes on a pair of lumbar pillows.",
                    img("1616627561950-9f746e330187")),
            new P("Terra Ceramic Vase", "Terra Kiln", "vases-candles", "Living Room", "Minimalist", "Cream", "Ceramic", 2899, null, 45, cm(22, 22, 30), 2, false, false, false,
                    "Hand-thrown stoneware with a matte glaze.",
                    img("1612196808214-b8e1d6145a8c")),
            new P("Blossom Bud Vase Trio", "Terra Kiln", "vases-candles", "Dining Room", "Scandinavian", "White", "Ceramic", 1999, 2599, 70, cm(10, 10, 20), 1, false, false, false,
                    "Three slim bud vases on a wooden tray.",
                    img("1490312278390-ab64016e0aa9")),
            new P("Cedar & Fig Soy Candle", "Terra Kiln", "vases-candles", "Living Room", "Minimalist", "Amber", "Glass", 1299, null, 100, cm(9, 9, 10), 1, false, false, false,
                    "Hand-poured soy wax in reusable amber glass. About 45 hours of burn time.",
                    img("1603006905003-be475563bc59")),
            // Lighting
            new P("Arlo Adjustable Floor Lamp", "Lumen House", "floor-lamps", "Living Room", "Industrial", "Grey", "Metal", 6999, 8999, 30, cm(30, 30, 160), 6, true, false, true,
                    "Articulating arm and pivoting dome shade for reading light where you need it.",
                    img("1507473885765-e6ed057f782c"), img("1513694203232-719a280e022f")),
            new P("Tripod Linen Table Lamp", "Lumen House", "table-lamps", "Bedroom", "Scandinavian", "Natural", "Wood & Linen", 3999, null, 45, cm(35, 35, 55), 3, true, false, false,
                    "Beech tripod base with a linen drum shade that diffuses warm light.",
                    img("1517991104123-1d56a6e81ed9")),
            new P("Glow Orb Desk Lamp", "Lumen House", "table-lamps", "Office", "Modern", "White", "Glass", 2999, 3999, 50, cm(20, 20, 32), 2, false, false, false,
                    "Dimmable opal glass orb for a soft ambient glow.",
                    img("1543198126-a8ad8e47fb22")),
            new P("Brass Dome Pendant Light", "Lumen House", "pendants", "Dining Room", "Mid-Century", "Brass", "Aluminium", 8499, 10999, 18, cm(40, 40, 35), 3, true, false, false,
                    "Spun-brass dome that looks best hung in threes over a dining table.",
                    img("1540932239986-30128078f3c5")),
            new P("Harbor Enamel Pendant", "Lumen House", "pendants", "Kitchen", "Industrial", "White", "Enamel Steel", 4499, null, 28, cm(30, 30, 25), 2, true, false, false,
                    "Classic enamel warehouse shade with an adjustable cord.",
                    img("1513506003901-1e6a229e2d15"), img("1524484485831-a92ffc0de03f")),
            new P("Warehouse Bell Pendant", "Lumen House", "pendants", "Kitchen", "Industrial", "Grey", "Steel", 3999, 4999, 32, cm(35, 35, 28), 2, true, false, false,
                    "Matte grey bell shade over kitchen islands and breakfast bars.",
                    img("1565814329452-e1efa11c5b89")),
            // Kitchen
            new P("Ember Cast Iron Dutch Oven 5.5 L", "Hearth & Co.", "cookware", "Kitchen", "Traditional", "Orange", "Enameled Cast Iron", 8999, 11999, 40, cm(32, 26, 16), 6, false, true, true,
                    "Enameled cast iron that goes from stovetop to oven to table.",
                    img("1590794056226-79ef3a8147e1"), img("1556911220-bff31c812dba")),
            new P("Stoneware Serving Bowl", "Terra Kiln", "dinnerware", "Dining Room", "Minimalist", "Sand", "Stoneware", 1799, null, 80, cm(28, 28, 10), 1, false, false, false,
                    "Speckled glaze serving bowl, dishwasher and microwave safe.",
                    img("1603199506016-b9a594b593c0")),
            new P("Nord Wooden Bar Stool", "Nordvik", "bar-stools", "Kitchen", "Scandinavian", "White", "Beech Wood", 4999, 6499, 40, cm(40, 40, 75), 5, true, false, false,
                    "Counter-height stool in whitewashed beech with a footrest.",
                    img("1503602642458-232111445657"), img("1600585152220-90363fe7e115")),
            new P("Pop Counter Stool Set of 2", "Nordvik", "bar-stools", "Kitchen", "Modern", "Yellow", "Polypropylene", 8999, null, 24, cm(45, 48, 85), 9, true, true, false,
                    "Bright molded seats that wipe clean in seconds.",
                    img("1551298370-9d3d53740c72")),
            // Storage
            new P("Woven Rattan Market Basket", "Birch Row", "baskets", "Entryway", "Bohemian", "Orange", "Rattan", 2499, null, 55, cm(35, 20, 30), 1, false, false, false,
                    "Handwoven rattan with a leather strap; holds throws, magazines or produce.",
                    img("1590874103328-eac38a683ce7")),
            new P("Linden 2-Door Wardrobe", "Oakhaven", "wardrobes", "Bedroom", "Modern", "Walnut", "Engineered Wood", 28999, 34999, 9, cm(100, 58, 200), 85, true, true, false,
                    "Hanging rail, two shelves and soft-close doors in a walnut finish.",
                    img("1558997519-83ea9252edf8")),
            new P("Floating Cube Wall Shelves", "Birch Row", "wall-shelves", "Living Room", "Modern", "White", "Engineered Wood", 4999, 6499, 35, cm(120, 20, 60), 8, true, false, false,
                    "Set of mixed cubes and ledges with hidden mounting brackets.",
                    img("1594026112284-02bb6f3352fe")),
            // Kids & pets (listed by the demo marketplace seller)
            new P("Little Nook Kids Table & Chairs", "Wren Kids", "kids-furniture", "Kids Room", "Scandinavian", "White", "Wood", 6999, 8499, 20, cm(60, 60, 48), 9, true, false, false,
                    "Rounded corners and non-toxic finishes for crafts and snack time.",
                    img("1519710164239-da123dc03ef4")),
            new P("Cozy Knit Baby Blanket", "Wren Kids", "nursery", "Nursery", "Minimalist", "White", "Organic Cotton", 1999, null, 60, cm(80, 100, 1), 1, false, false, false,
                    "GOTS-certified organic cotton knit, soft enough for newborns.",
                    img("1555252333-9f8e92e65df9")),
            new P("Woven Seagrass Pet Bed", "Paws & Co.", "pet-beds", "Living Room", "Bohemian", "Natural", "Seagrass", 3499, 4499, 30, cm(60, 50, 20), 3, false, false, false,
                    "Handwoven seagrass bed with a removable, washable cushion.",
                    img("1600369671236-e74521d4b6ad"))
    );

    private static final Set<String> SELLER_BRANDS = Set.of("Wren Kids", "Paws & Co.", "Gallery Nine");

    private static final String[][] REVIEW_TEXT = {
            {"Even better in person", "The quality is excellent and it looks exactly like the photos. Delivery was on time and the team was careful."},
            {"Great value", "Very happy with this purchase. It took about 30 minutes to put together and feels sturdy."},
            {"Beautiful, minor issue", "Looks lovely in our home. One part arrived slightly scratched but support sent a replacement quickly."},
            {"Exactly what we needed", "Fits the space perfectly and the colour is true to the listing. Would buy from this brand again."},
            {"Good, not perfect", "Nice design and comfortable, though the finish is a little lighter than pictured."}
    };
    private static final int[] REVIEW_RATINGS = {5, 4, 3, 5, 4};

    private final AppProperties properties;
    private final UserRepository users;
    private final CategoryRepository categories;
    private final ProductRepository products;
    private final ReviewRepository reviews;
    private final PasswordEncoder passwords;
    private final ProductSearchIndex searchIndex;

    public DataSeeder(AppProperties properties, UserRepository users, CategoryRepository categories, ProductRepository products,
                      ReviewRepository reviews, PasswordEncoder passwords, ProductSearchIndex searchIndex) {
        this.properties = properties;
        this.users = users;
        this.categories = categories;
        this.products = products;
        this.reviews = reviews;
        this.passwords = passwords;
        this.searchIndex = searchIndex;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        var seed = properties.seed();
        if (seed.enabled()) {
            ensureUser("HomeNest Admin", seed.adminEmail(), seed.adminPassword(), Role.ADMIN);
            User seller = ensureUser("Wren Studio", seed.sellerEmail(), seed.sellerPassword(), Role.SELLER);
            if (categories.count() == 0) seedCatalog(seller);
        }
        if (searchIndex.enabled()) {
            var active = products.findAllActive();
            searchIndex.indexAll(active);
            log.info("Indexed {} products in Elasticsearch", active.size());
        }
    }

    private User ensureUser(String name, String email, String password, Role role) {
        User user = users.findByEmailIgnoreCase(email)
                .orElseGet(() -> users.save(new User(name, email, passwords.encode(password), role)));
        user.setEmailVerified(true);
        return users.save(user);
    }

    private void seedCatalog(User seller) {
        Map<String, Category> subs = new HashMap<>();
        int order = 0;
        for (Dept d : DEPARTMENTS) {
            Category dept = categories.save(new Category(d.name(), d.slug(), d.description(), d.image(), order++, null));
            int subOrder = 0;
            for (Sub s : d.subs()) {
                subs.put(s.slug(), categories.save(new Category(s.name(), s.slug(), null, s.image(), subOrder++, dept)));
            }
        }

        List<User> reviewers = new ArrayList<>();
        for (String name : List.of("Priya Sharma", "Arjun Mehta", "Neha Kapoor", "Rahul Verma", "Ananya Iyer")) {
            String email = Slugs.slugify(name).replace("-", ".") + "@example.com";
            reviewers.add(ensureUser(name, email, UUID.randomUUID().toString(), Role.CUSTOMER));
        }

        int index = 0;
        for (P p : PRODUCTS) {
            Category category = Objects.requireNonNull(subs.get(p.sub()), "Unknown sub-category " + p.sub());
            Product product = new Product(String.format("HN-%05d", 10001 + index), Slugs.slugify(p.name()));
            product.setName(p.name());
            product.setBrand(p.brand());
            product.setDescription(p.blurb() + " Sold by " + p.brand() + ". Free returns within 30 days.");
            product.setCategory(category);
            product.setRoom(p.room());
            product.setStyle(p.style());
            product.setColor(p.color());
            product.setMaterial(p.material());
            product.setPrice(BigDecimal.valueOf(p.price()));
            product.setCompareAtPrice(p.was() == null ? null : BigDecimal.valueOf(p.was()));
            product.setStock(p.stock());
            product.setDimensions(p.size()[0], p.size()[1], p.size()[2]);
            product.setWeightKg(p.kg());
            product.setAssemblyRequired(p.assembly());
            product.setFreeShipping(p.freeShip());
            product.setFeatured(p.featured());
            product.setImages(List.of(p.images()));
            if (SELLER_BRANDS.contains(p.brand())) product.setSeller(seller);
            product = products.save(product);

            // Deterministic demo reviews: 1 to 5 per product.
            int count = 1 + (index * 3) % 5;
            int sum = 0;
            for (int r = 0; r < count; r++) {
                int k = (index + r) % REVIEW_TEXT.length;
                int rating = REVIEW_RATINGS[k];
                sum += rating;
                reviews.save(new Review(product, reviewers.get(r), rating, REVIEW_TEXT[k][0], REVIEW_TEXT[k][1], true));
            }
            product.applyRating(sum / (double) count, count);
            index++;
        }
        log.info("Seeded {} departments, {} categories and {} products", DEPARTMENTS.size(), subs.size(), PRODUCTS.size());
    }
}
