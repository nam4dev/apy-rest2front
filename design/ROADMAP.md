# Roadmap
## 0.8.0: Initial P.O.C (Initial released version)
- Managed data representation fields
    - Primitive Fields
        - String
        - Number (Integer, Float, Decimal)
        - Boolean
        - Datetime
        - List
        - Nested (hashmap)
        - Embedded (hashmap-based)
        - Polymorph
        - Media (any resource kind)
    - GeoJSON Fields
        - Point
    - Minimal configuration system
    - Authentication System first implementation (based on Oauth2)

## 0.8.1: Add Generic mapping configuration system based on template (frontend / backend)
- Frontend
    - [`Angular`][angular] template
    - [`React`][react] template
- Backend
    - [`Eve`][angular] template
    - [`Django-rest-framework`][dj-rest-fwk] template

## 0.8.2: Add Eve configuration template (Bulk, soft_delete, ...)
## 0.8.3: Add Generic & dynamic configuration view (/settings)
## 0.8.4: Add more authentication system (ACL-based)
## 0.8.5: Add a GUI widget concept to Field (email, phone, video viewer, audio player, ...)
## 0.8.6: Add progress handlers for files & Resources (partially implemented)
## 0.8.7: Add schemas parser to generate GUI web `apy-rest2front` based on Swagger format
## 0.8.8: Add Pagination system (HATEOS)

[eve]: http://python-eve.org/
[angular]: https://angularjs.org/
[react]: https://facebook.github.io/react/
[dj-rest-fwk]: http://www.django-rest-framework.org/
