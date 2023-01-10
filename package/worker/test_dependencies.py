import pkg_resources
from pkg_resources import DistributionNotFound, VersionConflict

# dependencies can be any iterable with strings, 
# e.g. file line-by-line iterator
dependencies = [
    'jmespath==1.0.1',
    'pandas==1.5.0',
    'sqlalchemy==1.4.42',
    'xmlschema==2.1.1',
    'psycopg2-binary==2.9.4'
]

# here, if a dependency is not met, a DistributionNotFound or VersionConflict
# exception is thrown. 
pkg_resources.require(dependencies)