from django.urls import path
from .views import *

urlpatterns = [
    path('ask/', rag_query_view),
    path('index/', index_video_view)
]