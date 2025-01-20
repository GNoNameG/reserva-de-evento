from django.contrib import admin
from django.urls import path

from events.views import (
    register_user, login_user, logout_user,
    list_events, get_event_seats, reservar_asientos
)

urlpatterns = [
    path('admin/', admin.site.urls),

    # API
    path('api/register/', register_user, name='register'),
    path('api/login/', login_user, name='login'),
    path('api/logout/', logout_user, name='logout'),
    path('api/eventos/', list_events, name='list_events'),
    path('api/eventos/<int:event_id>/asientos/', get_event_seats, name='event_seats'),
    path('api/reservar/', reservar_asientos, name='reservar_asientos'),
]