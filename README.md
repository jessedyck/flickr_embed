# jd_flickr
WordPress plugin using php-flickr to pull in a specified user’s favourites and display with pagination using a shortcode.

**Note:** This is a rudimentary proof of concept, developed as a college assignment, and is in no way ready for production use. 

## Usage
[jd_flickr_gallery username="jessedyck" results=5 size=sm]

### Username
The flickr username who's photos will be displayed. The username is used to retreive flickr's user ID, which is then cached as a transient for 1 day and re-used on subsequent page loads.

### Results
The number of results per page, defaults to 3

### Size
2 options, small or large. Can be specified as small, sm, large, or lg.
