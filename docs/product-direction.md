# Dealo product direction

## Mission

Dealo is a Portugal-first, community-powered deal discovery platform. It should make it simple for people in Portugal to find, assess and share genuinely good offers across national retailers, local businesses and online stores.

The interaction model is inspired by leading community deal platforms such as HotUKDeals: the value comes from a useful, current deal feed, community judgement and clear information—not from requiring visitors to register before they can browse.

## Product principles

1. **Portugal first.** The launch market, language and editorial conventions are Portuguese. Product-controlled Portuguese copy is always `pt-PT`; `pt-BR` is not supported. `en-GB` remains the second supported locale.
2. **Guest-first discovery.** Anyone can browse, search and open current deals. Registration is for personal actions such as saving, voting, posting and personalisation.
3. **Community signals build trust.** Deal voting, comments, price history and deal status are future core capabilities. Their data model and moderation rules must be designed before they are exposed publicly.
4. **AI should be useful and accountable.** AI will help people find relevant deals, summarise terms, identify likely duplicates, surface price context and support moderation. It must not invent discounts, manipulate votes, make unlabelled recommendations, or replace the source and community evidence behind a deal.
5. **Merchant offers are one source, not the whole catalogue.** The current merchant workspace lets businesses create verified offers. Future community-submitted and retailer-imported deals will appear in the same consumer feed, clearly attributed by source.
6. **One platform, several clients.** Web and PWA launch first; iOS and Android will use the same product APIs and localisation rules.

## Product sequence

1. Establish a reliable public deal feed for Portugal: retailer/category/source metadata, expiry, search and guest browsing.
2. Add authenticated community participation: submissions, voting, saves, comments and moderation.
3. Add AI-assisted discovery and deal quality workflows behind transparent UI labels and measured evaluation criteria.
4. Expand mobile experiences through the shared APIs after the web interaction model is proven.

## Explicit non-goals for the first release

- Requiring an account to see deals
- Presenting AI-generated deal facts as verified information
- Treating merchant-created offers as the only content source
- Supporting Portuguese variants other than `pt-PT`
