# Create your models here.
from django.db import models
from django.contrib.auth.models import User

class Wallet(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    balance = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    def __str__(self):
        return f"{self.user.username}'s Wallet - ₹{self.balance}"


class Expense(models.Model):
    CATEGORY_CHOICES = [
        ('Breakfast', 'Breakfast'),
        ('Lunch', 'Lunch'),
        ('Dinner', 'Dinner'),
        ('Petrol', 'Petrol'),
        ('Other', 'Other'),
    ]


    user = models.ForeignKey(User, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=8, decimal_places=2)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    note = models.TextField(blank=True, default="")  # ✅ Add this line
# models.py
    date = models.DateField()

    def __str__(self):
        return f"{self.note} - ₹{self.amount} ({self.category})"


class Budget(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    daily_budget = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    monthly_budget = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    yearly_budget = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    notify_on_threshold = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.user.username}'s Budget"
